/**
 * CANDIDATE HTML GENERATOR - VS CODE EXTENSION
 * Integrates with GitHub Copilot Chat
 * 
 * Features:
 * - Interactive chat-based candidate profile collection
 * - Direct integration with generation scripts
 * - Real-time status and logging
 * - One-click HTML generation from VS Code
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let statusBarItem;
let outputChannel;

/**
 * Activate the extension
 */
function activate(context) {
  console.log('Candidate HTML Generator extension activated');
  
  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Candidate HTML Generator');
  
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'candidateHtmlGenerator.showStatus';
  statusBarItem.text = '$(file-code) Generate HTML';
  statusBarItem.tooltip = 'Click to generate personalized candidate HTML';
  statusBarItem.show();
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('candidateHtmlGenerator.generateFromChat', () => {
      generateFromChat();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('candidateHtmlGenerator.quickGenerate', () => {
      quickGenerate();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('candidateHtmlGenerator.showStatus', () => {
      showStatus();
    })
  );
  
  // Register Copilot Chat participant
  if (vscode.chat) {
    const participant = vscode.chat.createChatParticipant('candidateGenerator', handleChatRequest);
    context.subscriptions.push(participant);
  }
}

/**
 * Handle requests from GitHub Copilot Chat
 */
async function handleChatRequest(request, context, stream, token) {
  try {
    stream.progress('Processing your request...');
    
    const userInput = request.prompt.toLowerCase();
    
    // Check for different commands in chat
    if (userInput.includes('generate') || userInput.includes('create') || userInput.includes('html')) {
      stream.markdown('### 🎯 Candidate HTML Generator\n\n');
      stream.markdown('I can help you generate personalized interview preparation HTML files.\n\n');
      stream.markdown('**Available commands:**\n\n');
      
      // Option 1: Quick generation
      stream.markdown('1. **Quick Generate** - Use existing admin_export.json and resume files\n');
      stream.markdown('   - Command: `generate-quick`\n\n');
      
      // Option 2: Interactive setup
      stream.markdown('2. **Interactive Setup** - Answer questions to collect candidate data\n');
      stream.markdown('   - Command: `generate-interactive`\n\n');
      
      // Option 3: Direct file input
      stream.markdown('3. **From Files** - Specify exact file paths\n');
      stream.markdown('   - Command: `generate-files admin_export.json resume.txt`\n\n');
      
      return;
    }
    
    // Command: generate-interactive
    if (userInput.includes('interactive') || userInput.includes('setup')) {
      stream.markdown('### 📋 Interactive Candidate Profile Setup\n\n');
      stream.markdown('Let\'s collect the candidate information:\n\n');
      
      stream.markdown('**Step 1: Candidate Name**\n');
      stream.markdown('What is the candidate\'s full name?\n\n');
      
      // In a real implementation, you would capture responses
      stream.markdown('*Note: In the future, responses will be captured interactively*\n');
      
      return;
    }
    
    // Command: generate-quick
    if (userInput.includes('quick')) {
      stream.markdown('### ⚡ Quick Generation\n\n');
      stream.markdown('Looking for files:\n');
      stream.markdown('- `admin_export.json`\n');
      stream.markdown('- `resume.txt` (optional)\n\n');
      
      const result = await runGenerationScript('admin_export.json', 'resume.txt', stream);
      
      if (result.success) {
        stream.markdown(`✅ **Success!** Generated: \`${result.filename}\`\n\n`);
        stream.markdown(`**Details:**\n`);
        stream.markdown(`- Candidate: ${result.candidateName}\n`);
        stream.markdown(`- Role: ${result.role}\n`);
        stream.markdown(`- Experience: ${result.experience} years\n`);
        stream.markdown(`- Skills: ${result.skillCount}\n`);
        stream.markdown(`- Topics: ${result.topicCount}\n`);
      } else {
        stream.markdown(`❌ **Error:** ${result.error}\n`);
      }
      
      return;
    }
    
    // Command: generate-files
    if (userInput.includes('generate-files') || userInput.includes('files')) {
      // Extract file paths from user input
      const fileMatch = userInput.match(/(?:generate-files|files)\s+(.+?)\s+(.+?)(?:\s|$)/);
      
      if (fileMatch) {
        const adminFile = fileMatch[1];
        const resumeFile = fileMatch[2];
        
        stream.markdown(`### 📄 Generating from Files\n\n`);
        stream.markdown(`- Admin Export: \`${adminFile}\`\n`);
        stream.markdown(`- Resume: \`${resumeFile}\`\n\n`);
        
        const result = await runGenerationScript(adminFile, resumeFile, stream);
        
        if (result.success) {
          stream.markdown(`✅ **Success!**\n\n`);
          stream.markdown(`Generated: \`${result.filename}\`\n`);
        } else {
          stream.markdown(`❌ **Error:** ${result.error}\n`);
        }
      } else {
        stream.markdown('Please provide file paths: `generate-files admin.json resume.txt`\n');
      }
      
      return;
    }
    
    // Default: show help
    stream.markdown('### 💬 Candidate HTML Generator Chat Participant\n\n');
    stream.markdown('I help generate personalized interview preparation HTML files.\n\n');
    stream.markdown('**Try asking:**\n');
    stream.markdown('- "generate html for candidate"\n');
    stream.markdown('- "quick generate"\n');
    stream.markdown('- "interactive setup"\n');
    stream.markdown('- "generate-files admin.json resume.txt"\n');
    
  } catch (error) {
    stream.markdown(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Running the generation script and stream output
 */
async function runGenerationScript(adminFile, resumeFile, stream) {
  return new Promise((resolve) => {
    try {
      // Check if files exist
      if (!fs.existsSync(adminFile)) {
        resolve({ success: false, error: `File not found: ${adminFile}` });
        return;
      }
      
      // Determine script to run (Node.js or Python)
      const scriptFile = fs.existsSync('generate-candidate-html.js') 
        ? 'generate-candidate-html.js' 
        : 'generate-candidate-html.py';
      
      const scriptPath = path.join(__dirname, scriptFile);
      const args = [scriptPath, adminFile];
      
      if (resumeFile && fs.existsSync(resumeFile)) {
        args.push(resumeFile);
      }
      
      const command = scriptFile.endsWith('.js') ? 'node' : 'python';
      
      stream.markdown('⏳ Generating...\n\n');
      
      let output = '';
      let errorOutput = '';
      
      // Execute script
      const proc = spawn(command, args, { cwd: __dirname });
      
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          // Parse output to extract details
          const lines = output.split('\n');
          const filenameMatch = output.match(/candidate_[\w_]+\.html/);
          
          resolve({
            success: true,
            filename: filenameMatch ? filenameMatch[0] : 'generated.html',
            candidateName: extractValue(output, 'Candidate:'),
            role: extractValue(output, 'Role:'),
            experience: extractValue(output, 'Experience:').replace(' years', ''),
            skillCount: extractValue(output, 'Skills:'),
            topicCount: extractValue(output, 'Topics:')
          });
        } else {
          resolve({ 
            success: false, 
            error: errorOutput || 'Generation failed' 
          });
        }
      });
      
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

function extractValue(text, key) {
  const regex = new RegExp(`${key}\\s*(.+?)(?:\\n|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : 'N/A';
}

/**
 * Quick generate command
 */
async function quickGenerate() {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }
    
    const adminFile = path.join(workspaceFolder.uri.fsPath, 'admin_export.json');
    
    if (!fs.existsSync(adminFile)) {
      vscode.window.showErrorMessage(`File not found: admin_export.json`);
      return;
    }
    
    outputChannel.clear();
    outputChannel.appendLine('🚀 Starting generation...');
    outputChannel.show();
    
    // Show progress
    vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Generating Candidate HTML' },
      async (progress) => {
        progress.report({ increment: 0, message: 'Reading files...' });
        
        // Run the script
        const scriptFile = 'generate-candidate-html.js';
        const args = [adminFile];
        
        const resumeFile = path.join(workspaceFolder.uri.fsPath, 'resume.txt');
        if (fs.existsSync(resumeFile)) {
          args.push(resumeFile);
        }
        
        return new Promise((resolve) => {
          const proc = spawn('node', [scriptFile, ...args], { cwd: workspaceFolder.uri.fsPath });
          
          proc.stdout.on('data', (data) => {
            outputChannel.appendLine(data.toString());
          });
          
          proc.stderr.on('data', (data) => {
            outputChannel.appendLine(`ERROR: ${data.toString()}`);
          });
          
          proc.on('close', (code) => {
            if (code === 0) {
              vscode.window.showInformationMessage('✅ HTML generated successfully!');
              progress.report({ increment: 100, message: 'Complete!' });
            } else {
              vscode.window.showErrorMessage('Generation failed. Check output for details.');
            }
            resolve();
          });
        });
      }
    );
    
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

/**
 * Show status
 */
function showStatus() {
  const statusMessage = `
Candidate HTML Generator - Status

📊 Configuration:
- Base Template: structured.html
- Output Directory: ./
- Auto Backup: Enabled

📝 Quick Commands:
- Generate from Chat: @candidateGenerator generate
- Quick Generate: Cmd+Shift+P → Quick Generate from Files
- Interactive Setup: @candidateGenerator interactive

📄 Expected Files:
- admin_export.json (from Admin Console)
- resume.txt (optional, for better extraction)

✅ Ready to generate personalized candidate HTML files!
  `;
  
  vscode.window.showInformationMessage(statusMessage);
}

/**
 * Deactivate the extension
 */
function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
}

module.exports = { activate, deactivate };
