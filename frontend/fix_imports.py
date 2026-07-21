import os
import re

directory = r"d:\churops upgraded\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(match):
        imports_str = match.group(1)
        path = match.group(2)
        imports = [x.strip() for x in imports_str.split(',')]
        
        funcs = []
        types = []
        for imp in imports:
            if not imp: continue
            if imp[0].isupper():
                types.append(imp)
            else:
                funcs.append(imp)
        
        lines = []
        if funcs:
            lines.append(f'import {{ {", ".join(funcs)} }} from "{path}";')
        if types:
            lines.append(f'import type {{ {", ".join(types)} }} from "{path}";')
            
        return "\n".join(lines)
    
    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+"((\.\./)+api/[^"]+)";')
    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))
