import os
import sys

# Pre-defined database of package licenses in our stack to audit against copyleft rules
LICENSE_REGISTRY = {
    "fastapi": "MIT",
    "uvicorn": "BSD-3-Clause",
    "pydantic": "MIT",
    "langgraph": "MIT",
    "chromadb": "Apache-2.0",
    "sentence-transformers": "Apache-2.0",
    "sqlalchemy": "MIT",
    "psycopg2-binary": "LGPL-3.0-or-later",  # Binary wrapper, allowed for commercial dynamic link usage
    "python-dotenv": "BSD-3-Clause",
    "httpx": "BSD-3-Clause",
    "websockets": "BSD-3-Clause",
    "pillow": "HPND",
    "pytest": "MIT",
    "pytest-asyncio": "MIT",
    "python-multipart": "Apache-2.0"
}

def audit_licenses():
    print("=== DEPENDENCY LICENSE COMPLIANCE AUDIT ===")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    req_file = os.path.join(base_dir, 'backend', 'requirements.txt')
    
    if not os.path.exists(req_file):
        print(f"Error: Requirements file not found at: {req_file}")
        sys.exit(1)
        
    permissive_count = 0
    warnings_count = 0
    
    with open(req_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            # Extract package name (ignoring version specifiers)
            package = line.split('>=')[0].split('==')[0].strip().lower()
            
            license_type = LICENSE_REGISTRY.get(package, "Unknown / Unregistered")
            
            # Simple policy check (warning on Copyleft like GPL, but permissive on MIT/Apache/BSD)
            is_copyleft = any(term in license_type.lower() for term in ["gpl", "agpl"])
            
            status = "APPROVED"
            if is_copyleft:
                status = "WARNING (Copyleft License)"
                warnings_count += 1
            elif license_type == "Unknown / Unregistered":
                status = "REVIEW REQUIRED"
                warnings_count += 1
            else:
                permissive_count += 1
                
            print(f"Package: {package:<25} | License: {license_type:<20} | Status: {status}")
            
    print("\n=== AUDIT SUMMARY ===")
    print(f"Permissive Commercial Licenses:  {permissive_count}")
    print(f"Requires Manual Review/Warning: {warnings_count}")
    
    if warnings_count > 0:
        print("\nNote: psycopg2-binary uses LGPL, which is standard for commercial database connectors.")
        print("For standalone distributed software products, ensure dynamic linking compliance.")
    else:
        print("\nAll dependencies fully compliant for commercial SaaS deployment.")

if __name__ == '__main__':
    audit_licenses()
