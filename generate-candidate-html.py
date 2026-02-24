#!/usr/bin/env python3

"""
PERSONALIZED HTML GENERATOR - PYTHON VERSION
One-Click Candidate Profile → Personalized structured.html

Usage:
    python generate-candidate-html.py admin_export.json [resume.txt]

Example:
    python generate-candidate-html.py admin_export.json
    python generate-candidate-html.py admin_export.json resume.txt
    python generate-candidate-html.py ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json
"""

import json
import os
import sys
import re
from datetime import datetime
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG = {
    'baseTemplateFile': 'structured.html',
    'outputDir': './',
    'logLevel': 'info',  # 'debug', 'info', 'warn', 'error'
    'validateBeforeGeneration': True,
    'autoBackup': True
}

SKILL_TO_TOPICS_MAP = {
    # Operating Systems
    'windows 10': ['windows-support', 'drivers', 'performance', 'windows-updates'],
    'windows 11': ['windows-support', 'windows-updates', 'drivers'],
    'windows': ['windows-support', 'drivers', 'performance'],
    'macos': ['login-profile'],
    'linux': ['performance', 'drivers'],
    
    # Networking
    'tcp/ip': ['lan-wifi', 'tcpip'],
    'dns': ['dns', 'lan-wifi'],
    'dhcp': ['dhcp', 'lan-wifi'],
    'vpn': ['vpn', 'vpn-errors'],
    'active directory': ['login-profile', 'active-directory'],
    'lan/wifi': ['lan-wifi'],
    'network': ['lan-wifi', 'dns', 'dhcp', 'tcpip'],
    
    # Support Software
    'servicenow': ['servicenow', 'sla', 'incident-request', 'escalation'],
    'remote desktop': ['rdp'],
    'anydesk': ['anydesk'],
    'teamviewer': ['anydesk'],
    
    # Tools
    'task manager': ['performance', 'windows-support'],
    'event viewer': ['performance', 'windows-support'],
    'device manager': ['drivers', 'hardware'],
    
    # Office
    'excel': ['spreadsheet-basic', 'spreadsheet-advanced'],
    'outlook': ['outlook', 'email-rules'],
    'teams': ['teams', 'teams-meetings'],
    
    # Domain-Specific
    'recruitment': ['talent-acquisition', 'candidate-assessment'],
    'bgv': ['bgv-process', 'compliance'],
    'sap': ['sap-finance', 'erp-systems'],
    'accounting': ['general-ledger', 'reconciliation'],
    'sales': ['sales-process', 'objection-handling'],
    'python': ['programming', 'automation'],
    'sql': ['database-basics', 'database-advanced']
}

# ============================================================================
# LOGGING
# ============================================================================

class Logger:
    @staticmethod
    def debug(msg):
        Logger._log('DEBUG', msg, '\033[36m')  # Cyan
    
    @staticmethod
    def info(msg):
        Logger._log('INFO', msg, '\033[32m')  # Green
    
    @staticmethod
    def warn(msg):
        Logger._log('WARN', msg, '\033[33m')  # Yellow
    
    @staticmethod
    def error(msg):
        Logger._log('ERROR', msg, '\033[31m')  # Red
    
    @staticmethod
    def success(msg):
        Logger._log('✓', msg, '\033[92m')  # Bright Green
    
    @staticmethod
    def _log(level, message, color=''):
        reset = '\033[0m'
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f'{color}[{timestamp}] {level}{reset} {message}')

# ============================================================================
# FILE I/O
# ============================================================================

def read_file(file_path):
    try:
        if not os.path.exists(file_path):
            Logger.error(f'File not found: {file_path}')
            return None
        Logger.debug(f'Reading file: {file_path}')
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as error:
        Logger.error(f'Error reading file {file_path}: {str(error)}')
        return None

def write_file(file_path, content):
    try:
        # Backup if exists
        if CONFIG['autoBackup'] and os.path.exists(file_path):
            backup_path = f'{file_path}.backup_{int(datetime.now().timestamp())}'
            with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
                dst.write(src.read())
            Logger.debug(f'Backup created: {backup_path}')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        Logger.success(f'File saved: {file_path}')
        return True
    except Exception as error:
        Logger.error(f'Error writing file {file_path}: {str(error)}')
        return False

def file_exists(file_path):
    return os.path.exists(file_path)

# ============================================================================
# JSON PARSING
# ============================================================================

def parse_json(json_string, file_name='JSON'):
    try:
        Logger.debug(f'Parsing {file_name}...')
        data = json.loads(json_string)
        Logger.debug(f'Successfully parsed {file_name}')
        return data
    except json.JSONDecodeError as error:
        Logger.error(f'Invalid JSON in {file_name}: {str(error)}')
        return None

def validate_admin_console_export(data):
    Logger.debug('Validating Admin Console export structure...')
    required_fields = [
        'adminConsoleExport.candidateDetails.recordInfo.candidateId',
        'adminConsoleExport.candidateDetails.personalInformation.fullName',
    ]
    
    all_valid = True
    for field in required_fields:
        value = get_nested_property(data, field)
        if not value:
            Logger.warn(f'Missing field: {field}')
            all_valid = False
    
    return all_valid

def get_nested_property(obj, path):
    """Get nested property from dict using dot notation"""
    parts = path.split('.')
    current = obj
    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        else:
            return None
    return current

# ============================================================================
# RESUME PARSING
# ============================================================================

def parse_resume(resume_text):
    Logger.debug('Parsing resume...')
    
    resume = {
        'skills': [],
        'experience': [],
        'education': [],
        'certifications': [],
        'achievements': [],
        'summary': ''
    }
    
    if not resume_text:
        return resume
    
    # Extract skills
    skills_match = re.search(r'(?:TECHNICAL\s+)?SKILLS[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))', resume_text, re.IGNORECASE)
    if skills_match:
        skills_text = skills_match.group(0)
        skill_items = re.findall(r'•\s*([^\n]+)', skills_text)
        resume['skills'].extend([s.strip() for s in skill_items])
    
    # Extract achievements
    achievements_match = re.search(r'(?:KEY\s+)?ACHIEVEMENTS[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))', resume_text, re.IGNORECASE)
    if achievements_match:
        achievements_text = achievements_match.group(0)
        achievement_items = re.findall(r'•\s*([^\n]+)', achievements_text)
        resume['achievements'].extend([a.strip() for a in achievement_items])
    
    # Extract summary
    summary_match = re.search(r'(?:PROFESSIONAL\s+)?SUMMARY[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))', resume_text, re.IGNORECASE)
    if summary_match:
        summary = summary_match.group(0).replace('PROFESSIONAL SUMMARY', '').replace('SUMMARY', '').strip()
        resume['summary'] = summary[:500]
    
    Logger.debug(f'Extracted {len(resume["skills"])} skills from resume')
    Logger.debug(f'Extracted {len(resume["achievements"])} achievements from resume')
    
    return resume

# ============================================================================
# DATA MERGING
# ============================================================================

def map_skills_to_topics(skills_list):
    Logger.debug('Mapping skills to topics...')
    
    topics = set()
    excluded_topics = set()
    
    if not isinstance(skills_list, list):
        skills_list = []
    
    for skill in skills_list:
        if not skill:
            continue
        
        skill_lower = skill.lower()
        
        for key, topic_list in SKILL_TO_TOPICS_MAP.items():
            if key in skill_lower or skill_lower in key:
                topics.update(topic_list)
    
    # Set exclusions
    all_skills_text = ' '.join(skills_list).lower()
    if 'macos' not in all_skills_text and 'apple' not in all_skills_text:
        excluded_topics.add('macos')
    if 'linux' not in all_skills_text:
        excluded_topics.add('linux')
    if 'python' not in all_skills_text and 'java' not in all_skills_text:
        excluded_topics.add('programming')
    
    return {
        'includeTopics': list(topics),
        'excludeTopics': list(excluded_topics)
    }

def determine_domain(skills):
    skills_text = ' '.join(skills).lower()
    
    if 'servicenow' in skills_text or 'windows' in skills_text:
        return 'IT Support'
    if 'recruitment' in skills_text or 'bgv' in skills_text:
        return 'HR/Recruitment'
    if 'sap' in skills_text or 'accounting' in skills_text:
        return 'Finance'
    if 'sales' in skills_text:
        return 'Sales'
    return 'General'

def determine_level(years):
    if years <= 2:
        return 'beginner'
    if years <= 5:
        return 'intermediate'
    return 'expert'

def merge_admin_console_and_resume(admin_console_raw, resume_raw=''):
    Logger.info('Merging Admin Console export and resume data...')
    
    admin_data = parse_json(admin_console_raw) if isinstance(admin_console_raw, str) else admin_console_raw
    if not admin_data:
        return None
    
    if not validate_admin_console_export(admin_data):
        Logger.warn('Admin Console export validation failed, proceeding with available data')
    
    resume_data = parse_resume(resume_raw or '')
    
    try:
        candidate_details = admin_data.get('adminConsoleExport', {}).get('candidateDetails', {})
        personal_info = candidate_details.get('personalInformation', {})
        employment_history = candidate_details.get('employmentHistory', {})
        current_company = employment_history.get('currentCompany', {})
        
        # Extract skills
        admin_skills = current_company.get('skills', []) + current_company.get('tools', [])
        resume_skills = resume_data.get('skills', [])
        all_skills = list(set(admin_skills + resume_skills))
        
        topics_mapping = map_skills_to_topics(all_skills)
        
        # Build merged config
        full_name = personal_info.get('fullName', 'Candidate').split(' ', 1)
        first_name = full_name[0] if full_name else 'Candidate'
        last_name = full_name[1] if len(full_name) > 1 else ''
        
        years_exp = employment_history.get('totalExperience', {}).get('years', 0)
        
        merged_config = {
            'candidate': {
                'personalInfo': {
                    'candidateId': candidate_details.get('recordInfo', {}).get('candidateId', 'UNKNOWN'),
                    'firstName': first_name,
                    'lastName': last_name,
                    'email': personal_info.get('professionalEmail', personal_info.get('personalEmail', '')),
                    'phone': personal_info.get('phoneNumber', personal_info.get('whatsappNumber', '')),
                    'title': current_company.get('designation', 'Professional'),
                    'yearsOfExperience': years_exp
                },
                'targetRole': {
                    'title': current_company.get('designation', 'Professional'),
                    'domain': determine_domain(all_skills),
                    'level': determine_level(years_exp),
                    'description': resume_data.get('summary', '')
                },
                'technicalSkills': all_skills,
                'achievements': resume_data.get('achievements', []),
                'customQuestionFilters': {
                    'includeTopics': topics_mapping['includeTopics'],
                    'excludeTopics': topics_mapping['excludeTopics'],
                    'emphasizeAreas': ['General Proficiency'],
                    'difficultyDistribution': {
                        'beginner': 5 if years_exp > 3 else 30,
                        'intermediate': 50,
                        'expert': 45 if years_exp > 3 else 20
                    }
                }
            }
        }
        
        Logger.success(f'Merged configuration created for {merged_config["candidate"]["personalInfo"]["firstName"]} {merged_config["candidate"]["personalInfo"]["lastName"]}')
        Logger.debug(f'Topics included: {len(merge_config["candidate"]["customQuestionFilters"]["includeTopics"])}')
        Logger.debug(f'Skills extracted: {len(all_skills)}')
        
        return merged_config
    except Exception as error:
        Logger.error(f'Error merging data: {str(error)}')
        return None

# ============================================================================
# HTML GENERATION
# ============================================================================

def generate_personalized_html(base_html, merged_config):
    Logger.info('Generating personalized HTML...')
    
    html = base_html
    candidate = merged_config['candidate']
    
    first_name = candidate['personalInfo']['firstName']
    last_name = candidate['personalInfo']['lastName']
    role = candidate['targetRole']['title']
    domain = candidate['targetRole']['domain']
    
    welcome_message = f'Welcome, {first_name}! Your {role} Interview Preparation Path'
    
    # Insert metadata
    metadata = f'''
    <!-- PERSONALIZED METADATA -->
    <script>
      const CANDIDATE_NAME = "{first_name} {last_name}";
      const CANDIDATE_ID = "{candidate['personalInfo']['candidateId']}";
      const TARGET_ROLE = "{role}";
      const DOMAIN = "{domain}";
      const YEARS_EXPERIENCE = {candidate['personalInfo']['yearsOfExperience']};
      const TECHNICAL_SKILLS = {json.dumps(candidate['technicalSkills'])};
      const PERSONALIZED_CONFIG = {json.dumps(merged_config)};
    </script>
    '''
    
    if '<!-- METADATA -->' in html:
        html = html.replace('<!-- METADATA -->', metadata)
    else:
        html = html.replace('<script>', metadata + '<script>', 1)
    
    # Update welcome message
    html = re.sub(
        r'(<h1[^>]*>)Welcome[^<]*(<\/h1>)',
        f'\\1{welcome_message}\\2',
        html,
        flags=re.IGNORECASE
    )
    
    Logger.success('HTML generation complete')
    return html

# ============================================================================
# MAIN
# ============================================================================

def show_usage():
    usage = '''
╔════════════════════════════════════════════════════════════════╗
║     PERSONALIZED HTML GENERATOR - PYTHON VERSION               ║
║                                                                ║
║  Generate personalized structured.html from Admin Console       ║
║  candidate data + resume in ONE CLICK                          ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  python generate-candidate-html.py [adminConsoleJSON] [resumeFile]

ARGUMENTS:
  adminConsoleJSON   Path to Admin Console export JSON file (REQUIRED)
  resumeFile         Path to candidate resume file (OPTIONAL)

EXAMPLES:
  python generate-candidate-html.py admin_export.json
  python generate-candidate-html.py admin_export.json resume.txt
  python generate-candidate-html.py ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json

For more details, see: QUICK_START_GUIDE.md
    '''
    print(usage)

def main():
    Logger.info('========================================')
    Logger.info('PERSONALIZED HTML GENERATOR (PYTHON)')
    Logger.info('========================================')
    
    if len(sys.argv) < 2:
        show_usage()
        return
    
    admin_console_file = sys.argv[1]
    resume_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Step 1: Read Admin Console
    Logger.info('\nStep 1: Reading Admin Console export...')
    admin_console_raw = read_file(admin_console_file)
    if not admin_console_raw:
        Logger.error('Cannot proceed without Admin Console export')
        return
    
    # Step 2: Read resume
    Logger.info('Step 2: Reading resume file...')
    resume_raw = ''
    if resume_file and file_exists(resume_file):
        resume_raw = read_file(resume_file)
    elif resume_file:
        Logger.warn(f'Resume file not found: {resume_file}, proceeding without resume')
    else:
        Logger.info('No resume file provided, using Admin Console data only')
    
    # Step 3: Merge data
    Logger.info('Step 3: Merging data...')
    merged_config = merge_admin_console_and_resume(admin_console_raw, resume_raw)
    if not merged_config:
        Logger.error('Failed to merge data')
        return
    
    # Step 4: Read base template
    Logger.info('Step 4: Reading base template...')
    base_html = read_file(CONFIG['baseTemplateFile'])
    if not base_html:
        Logger.error(f'Base template not found: {CONFIG["baseTemplateFile"]}')
        return
    
    # Step 5: Generate HTML
    Logger.info('Step 5: Generating personalized HTML...')
    personalized_html = generate_personalized_html(base_html, merged_config)
    
    # Step 6: Save file
    Logger.info('Step 6: Saving output file...')
    first_name = merged_config['candidate']['personalInfo']['firstName'].lower()
    last_name = merged_config['candidate']['personalInfo']['lastName'].lower()
    role = merged_config['candidate']['targetRole']['title'].lower().replace(' ', '')
    output_file_name = f'candidate_{first_name}_{last_name}_{role}.html'
    output_path = os.path.join(CONFIG['outputDir'], output_file_name)
    
    if write_file(output_path, personalized_html):
        Logger.success('\n========================================')
        Logger.success('✓ GENERATION COMPLETE')
        Logger.success('========================================\n')
        Logger.info(f'Output File: {output_file_name}')
        Logger.info(f'Location: {output_path}')
        Logger.info(f'Candidate: {merged_config["candidate"]["personalInfo"]["firstName"]} {merged_config["candidate"]["personalInfo"]["lastName"]}')
        Logger.info(f'Role: {merged_config["candidate"]["targetRole"]["title"]}')
        Logger.info(f'Domain: {merged_config["candidate"]["targetRole"]["domain"]}')
        Logger.info(f'Experience: {merged_config["candidate"]["personalInfo"]["yearsOfExperience"]} years')
        Logger.info(f'Skills: {len(merged_config["candidate"]["technicalSkills"])}')
        Logger.info(f'Topics: {len(merged_config["candidate"]["customQuestionFilters"]["includeTopics"])}')
    else:
        Logger.error('Failed to save output file')

if __name__ == '__main__':
    main()
