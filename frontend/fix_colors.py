import os
import re

DIR = 'd:/SSN CLG/SEM4/IP/Assignments/MINI PROJECT/StuEventManagement_Application/frontend/src'

def process_file(fi):
    with open(fi, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacing text-white/\d+ with custom hex classes
    content = re.sub(r'text-white/(20|30|40|45|50|55)', r'text-[#9CA3AF]', content)
    content = re.sub(r'text-white/(60|70|75|80)', r'text-[#D1D5DB]', content)
    content = re.sub(r'text-white/85', r'text-[#F9FAFB]', content)
    # Be careful not to replace text-white/50 after text-[#...], only exact word `text-white`
    content = re.sub(r'\btext-white\b(?!/)', r'text-[#F9FAFB]', content)

    # Replacing rgba texts
    def repl_rgba_color(m):
        val_str = m.group(1)
        if val_str.startswith('.'): val_str = val_str[1:]
        op = float('0.' + val_str) if '0.'+val_str != '0.' else 0.0
        
        if op >= 0.8: return "color: '#F9FAFB'"
        if op >= 0.6: return "color: '#D1D5DB'"
        return "color: '#9CA3AF'"

    content = re.sub(r"color:\s*'rgba\(255,255,255,0\.([0-9]+)\)'", repl_rgba_color, content)
    
    # Border colors
    content = re.sub(r"border:\s*'1px solid rgba\(255,255,255,0\.[0-9]+\)'", "border: '1px solid #374151'", content)
    content = re.sub(r"borderColor:\s*'rgba\(255,255,255,0\.[0-9]+\)'", "borderColor: '#374151'", content)

    # Specific background patches
    content = content.replace('#030712', '#111827')
    content = content.replace('rgba(5,13,26,0.85)', 'rgba(17,24,39,0.9)')
    content = content.replace('rgba(255,107,0,0.15)', 'rgba(124, 58, 237, 0.15)')
    content = content.replace('rgba(255,107,0,0.25)', 'rgba(124, 58, 237, 0.25)')
    content = content.replace('rgba(255,107,0,0.05)', 'rgba(124, 58, 237, 0.05)')
    
    # CSS class patches
    content = content.replace('color: rgba(255,255,255,0.85)', 'color: #D1D5DB')
    content = content.replace('color: rgba(255,255,255,0.6)', 'color: #D1D5DB')
    content = content.replace('color: rgba(255,255,255,0.35)', 'color: #9CA3AF')
    content = content.replace('color: rgba(255,255,255,0.55)', 'color: #9CA3AF')

    with open(fi, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk(DIR):
    for fn in files:
        if fn.endswith('.tsx') or fn.endswith('.ts') or fn.endswith('.css'):
            process_file(os.path.join(root, fn))
