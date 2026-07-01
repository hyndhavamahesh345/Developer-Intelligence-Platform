import os
import json
import sys

# Add backend directory to Python system path to enable imports
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))

from app.services.vector import VectorService

def load_knowledge_base():
    print("=== STARTING KNOWLEDGE BASE INDEXING PIPELINE ===")
    
    # Initialize vector service
    vector_service = VectorService()
    
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(__file__))
    kb_dir = os.path.join(base_dir, 'knowledge-base')
    
    if not os.path.exists(kb_dir):
        print(f"Error: Knowledge base directory not found at: {kb_dir}")
        sys.exit(1)
        
    collection_name = "knowledge_base"
    print(f"Target ChromaDB Collection: {collection_name}")
    
    # Reset or clear collection first (optional, but good for fresh syncs)
    # We will just write/overwrite documents using stable IDs
    
    indexed_count = 0
    
    # Walk directory structure
    for root, dirs, files in os.walk(kb_dir):
        for file in files:
            if not file.endswith('.json'):
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, kb_dir)
            category = rel_path.split(os.sep)[0]
            
            print(f"Processing knowledge block: {rel_path} (Category: {category})")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Format documents based on category
                if category == 'projects':
                    # Extract metadata from JSON
                    project_id = data.get('project_id', 'unknown')
                    segment = data.get('segment', 'general')
                    title = data.get('title', project_id)
                    
                    # Convert full content to indexable string
                    content_str = f"Project: {title}\nSegment: {segment}\n"
                    if 'summary' in data:
                        content_str += f"Summary: {data['summary']}\n"
                    if 'description' in data:
                        content_str += f"Description: {data['description']}\n"
                    if 'features' in data:
                        content_str += f"Features:\n" + "\n".join([f"- {feat}" for feat in data['features']]) + "\n"
                    if 'tech_stack' in data:
                        content_str += f"Tech Stack: {', '.join(data['tech_stack'])}\n"
                    if 'components' in data:
                        content_str += f"Components:\n" + "\n".join([f"- {k}: {v}" for k, v in data['components'].items()]) + "\n"
                    if 'data_flow' in data:
                        content_str += f"Data Flow:\n" + "\n".join([f"{i+1}. {step}" for i, step in enumerate(data['data_flow'])]) + "\n"
                    if 'challenges' in data:
                        content_str += f"Challenges & Solutions:\n"
                        for item in data['challenges']:
                            content_str += f"- Issue: {item['issue']}\n  Impact: {item['impact']}\n  Solution: {item['solution']}\n"
                    if 'hardware_requirements' in data:
                        content_str += "Hardware Requirements:\n" + "\n".join([f"- {k}: {v}" for k, v in data['hardware_requirements'].items()]) + "\n"
                    if 'deployment_steps' in data:
                        content_str += "Deployment Steps:\n" + "\n".join([f"{i+1}. {s}" for i, s in enumerate(data['deployment_steps'])]) + "\n"
                    if 'performance_metrics' in data:
                        content_str += "Performance Metrics:\n" + "\n".join([f"- {k}: {v}" for k, v in data['performance_metrics'].items()]) + "\n"
                    if 'phases' in data:
                        content_str += "Feature Roadmap:\n"
                        for p in data['phases']:
                            content_str += f"- Quarter: {p['quarter']}\n  Milestone: {p['milestone']}\n  Details: {p['details']}\n"
                            
                    doc_id = f"project_{project_id}_{segment}"
                    metadata = {
                        "category": "projects",
                        "project_id": project_id,
                        "segment": segment,
                        "title": title
                    }
                    
                    vector_service.add_documents(
                        collection_name=collection_name,
                        ids=[doc_id],
                        documents=[content_str],
                        metadatas=[metadata]
                    )
                    indexed_count += 1
                    
                elif category == 'resume':
                    profile = data.get('profile', {})
                    name = profile.get('name', 'N Hyndhava Mahesh')
                    title = profile.get('title', 'AI Engineer')
                    
                    content_str = f"Resume Profile: {name}\nTitle: {title}\n"
                    content_str += f"Summary: {profile.get('summary', '')}\n"
                    content_str += f"Location: {profile.get('location', '')}\n"
                    content_str += f"Contact: Email: {profile.get('email', '')}, GitHub: {profile.get('github', '')}, LinkedIn: {profile.get('linkedin', '')}\n"
                    
                    if 'education' in data:
                        content_str += "\nEducation History:\n"
                        for edu in data['education']:
                            content_str += f"- {edu['degree']} at {edu['institution']} ({edu['period']}). GPA: {edu['gpa']}\n"
                            
                    if 'certifications' in data:
                        content_str += "\nCertifications:\n" + "\n".join([f"- {c}" for c in data['certifications']]) + "\n"
                        
                    doc_id = "resume_profile"
                    metadata = {
                        "category": "resume",
                        "title": f"Resume Profile: {name}"
                    }
                    
                    vector_service.add_documents(
                        collection_name=collection_name,
                        ids=[doc_id],
                        documents=[content_str],
                        metadatas=[metadata]
                    )
                    indexed_count += 1
                    
                elif category == 'experience':
                    # data is a list of experience dictionaries
                    for idx, exp in enumerate(data):
                        company = exp.get('company', 'Unknown')
                        role = exp.get('role', 'Developer')
                        period = exp.get('period', '')
                        
                        content_str = f"Experience Role: {role} at {company}\nPeriod: {period}\nLocation: {exp.get('location', '')}\n"
                        content_str += f"Description: {exp.get('description', '')}\n"
                        if 'highlights' in exp:
                            content_str += "Highlights:\n" + "\n".join([f"- {h}" for h in exp['highlights']]) + "\n"
                            
                        doc_id = f"experience_{company.replace(' ', '_').lower()}_{idx}"
                        metadata = {
                            "category": "experience",
                            "company": company,
                            "role": role,
                            "period": period
                        }
                        
                        vector_service.add_documents(
                            collection_name=collection_name,
                            ids=[doc_id],
                            documents=[content_str],
                            metadatas=[metadata]
                        )
                        indexed_count += 1
                        
                elif category == 'skills':
                    # data is a dictionary containing domain arrays
                    content_str = "Technical Skill Inventory:\n"
                    for domain in data.get('domains', []):
                        content_str += f"\nDomain: {domain['name']}\n"
                        for s in domain.get('skills', []):
                            content_str += f"- {s['name']} (Level: {s['level']}, Confidence: {s['percentage']}%)\n"
                            
                    doc_id = "skills_inventory"
                    metadata = {
                        "category": "skills",
                        "title": "Skills Inventory"
                    }
                    
                    vector_service.add_documents(
                        collection_name=collection_name,
                        ids=[doc_id],
                        documents=[content_str],
                        metadatas=[metadata]
                    )
                    indexed_count += 1
                    
            except Exception as e:
                print(f"Failed to process {rel_path}: {e}")
                
    print(f"\n=== INDEXING COMPLETED SUCCESSFULLY. INDEXED {indexed_count} BLOCKS ===")

if __name__ == '__main__':
    load_knowledge_base()
