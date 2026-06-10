import json
import random

sectors = [
    "Agriculture & Allied", "Manufacturing", "Information Technology", "Construction",
    "Healthcare", "Education", "Retail & Trade", "Transportation & Logistics",
    "Financial Services", "Public Administration"
]

states = ["All India", "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Gujarat"]

occupations_data = [
    # Agriculture
    {"name": "Crop Farmer", "sector": "Agriculture & Allied", "emp_base": 120000000, "wage_base": 120000, "growth": 1.5, "ai": 1.0, "ai_rationale": "Predominantly physical labor in unpredictable environments. Very minimal AI exposure in core tasks."},
    {"name": "Agricultural Labourer", "sector": "Agriculture & Allied", "emp_base": 140000000, "wage_base": 90000, "growth": 0.5, "ai": 0.5, "ai_rationale": "Entirely physical manual work. AI has essentially no impact on daily work."},
    {"name": "Dairy Farmer", "sector": "Agriculture & Allied", "emp_base": 15000000, "wage_base": 150000, "growth": 2.5, "ai": 1.5, "ai_rationale": "Physical animal husbandry. Minor exposure to automated farm management systems."},
    
    # Manufacturing
    {"name": "Textile Worker", "sector": "Manufacturing", "emp_base": 30000000, "wage_base": 180000, "growth": 3.0, "ai": 2.0, "ai_rationale": "Factory floor work. Susceptible to physical automation but less to generative/digital AI."},
    {"name": "Machine Operator", "sector": "Manufacturing", "emp_base": 12000000, "wage_base": 240000, "growth": 4.5, "ai": 3.5, "ai_rationale": "Operates physical machinery. AI is improving predictive maintenance but human oversight remains critical."},
    {"name": "Assembly Line Worker", "sector": "Manufacturing", "emp_base": 8000000, "wage_base": 200000, "growth": 2.0, "ai": 3.0, "ai_rationale": "Routine physical tasks. Highly exposed to robotics but moderate exposure to digital AI."},
    {"name": "Industrial Engineer", "sector": "Manufacturing", "emp_base": 800000, "wage_base": 600000, "growth": 6.5, "ai": 6.5, "ai_rationale": "Knowledge work focused on process optimization. AI tools will heavily assist in design and analytics."},

    # Information Technology
    {"name": "Software Developer", "sector": "Information Technology", "emp_base": 3500000, "wage_base": 900000, "growth": 12.0, "ai": 9.0, "ai_rationale": "Core tasks are coding and system design. Very high exposure to AI code assistants and autonomous agents."},
    {"name": "IT Support Specialist", "sector": "Information Technology", "emp_base": 1200000, "wage_base": 400000, "growth": 5.0, "ai": 7.5, "ai_rationale": "Troubleshooting and user support. AI chatbots and automated resolution systems will reshape this role heavily."},
    {"name": "Data Analyst", "sector": "Information Technology", "emp_base": 800000, "wage_base": 750000, "growth": 15.0, "ai": 8.5, "ai_rationale": "Data processing and reporting. AI tools can increasingly automate data cleaning and basic visualization."},
    {"name": "System Administrator", "sector": "Information Technology", "emp_base": 600000, "wage_base": 650000, "growth": 6.0, "ai": 7.0, "ai_rationale": "Infrastructure management. High exposure to automated monitoring and AI-driven infrastructure provisioning."},
    {"name": "BPO/Call Center Executive", "sector": "Information Technology", "emp_base": 4500000, "wage_base": 250000, "growth": -2.0, "ai": 9.5, "ai_rationale": "Routine customer interactions and data entry. Maximum exposure to conversational AI and LLMs."},

    # Construction
    {"name": "Construction Labourer", "sector": "Construction", "emp_base": 45000000, "wage_base": 140000, "growth": 5.5, "ai": 0.5, "ai_rationale": "Physical, dynamic environments requiring manual labor. Almost zero digital AI exposure."},
    {"name": "Mason", "sector": "Construction", "emp_base": 15000000, "wage_base": 220000, "growth": 4.0, "ai": 1.0, "ai_rationale": "Skilled physical trade. Low exposure as tasks require real-world dexterity."},
    {"name": "Civil Engineer", "sector": "Construction", "emp_base": 1100000, "wage_base": 500000, "growth": 7.0, "ai": 5.5, "ai_rationale": "Design and project management. Moderate exposure as AI assists with CAD, scheduling, and structural analysis."},
    {"name": "Architect", "sector": "Construction", "emp_base": 300000, "wage_base": 650000, "growth": 6.5, "ai": 7.5, "ai_rationale": "Design and drafting. Generative AI will significantly impact conceptual design and drafting workflows."},

    # Healthcare
    {"name": "Registered Nurse", "sector": "Healthcare", "emp_base": 3200000, "wage_base": 350000, "growth": 8.0, "ai": 4.0, "ai_rationale": "Requires physical patient care and empathy. AI assists with charting but cannot replace human bedside care."},
    {"name": "General Physician", "sector": "Healthcare", "emp_base": 1200000, "wage_base": 800000, "growth": 7.5, "ai": 5.5, "ai_rationale": "Diagnosis and treatment planning. AI acts as a powerful diagnostic assistant, but human judgment remains essential."},
    {"name": "Pharmacist", "sector": "Healthcare", "emp_base": 1500000, "wage_base": 400000, "growth": 6.0, "ai": 6.0, "ai_rationale": "Dispensing medication and advising. AI can automate prescription checking and inventory management."},
    {"name": "Medical Laboratory Technician", "sector": "Healthcare", "emp_base": 800000, "wage_base": 280000, "growth": 9.0, "ai": 6.5, "ai_rationale": "Analyzing samples. High exposure to AI computer vision for scan analysis and automated testing pipelines."},
    {"name": "ASHA Worker (Community Health)", "sector": "Healthcare", "emp_base": 1000000, "wage_base": 120000, "growth": 4.0, "ai": 2.0, "ai_rationale": "Community-level primary care and outreach. Highly interpersonal and field-based. Low AI exposure."},

    # Education
    {"name": "Primary School Teacher", "sector": "Education", "emp_base": 4500000, "wage_base": 300000, "growth": 4.5, "ai": 5.0, "ai_rationale": "Teaching young children requires significant empathy and classroom management. AI helps with lesson planning."},
    {"name": "High School Teacher", "sector": "Education", "emp_base": 3500000, "wage_base": 450000, "growth": 5.0, "ai": 6.0, "ai_rationale": "Subject-matter instruction. AI tutoring systems will supplement teaching and automate grading."},
    {"name": "University Professor", "sector": "Education", "emp_base": 1200000, "wage_base": 900000, "growth": 6.5, "ai": 6.5, "ai_rationale": "Higher education and research. AI will heavily assist in research synthesis and content generation."},
    {"name": "Private Tutor", "sector": "Education", "emp_base": 2500000, "wage_base": 200000, "growth": 8.0, "ai": 7.5, "ai_rationale": "Personalized instruction. Highly exposed to personalized AI tutoring platforms and digital learning tools."},

    # Retail & Trade
    {"name": "Retail Salesperson", "sector": "Retail & Trade", "emp_base": 25000000, "wage_base": 180000, "growth": 6.0, "ai": 4.5, "ai_rationale": "Customer-facing store role. E-commerce and AI recommendation systems are shifting the landscape, though physical stores remain."},
    {"name": "Kirana Store Owner", "sector": "Retail & Trade", "emp_base": 12000000, "wage_base": 300000, "growth": 2.5, "ai": 3.0, "ai_rationale": "Small business management. AI may help with supply chain apps, but physical retail presence dominates."},
    {"name": "Cashier", "sector": "Retail & Trade", "emp_base": 5000000, "wage_base": 150000, "growth": 1.0, "ai": 7.0, "ai_rationale": "Routine transaction processing. Highly exposed to automated checkout and computer vision systems."},
    {"name": "E-commerce Operations Executive", "sector": "Retail & Trade", "emp_base": 1500000, "wage_base": 350000, "growth": 14.0, "ai": 8.0, "ai_rationale": "Digital inventory and listing management. High exposure to AI content generation and automated pricing."},

    # Transportation & Logistics
    {"name": "Truck Driver", "sector": "Transportation & Logistics", "emp_base": 8000000, "wage_base": 300000, "growth": 5.5, "ai": 4.0, "ai_rationale": "Physical vehicle operation. While autonomous driving is an AI domain, adoption in India will be slow due to road complexities."},
    {"name": "Delivery Executive (Gig Worker)", "sector": "Transportation & Logistics", "emp_base": 6000000, "wage_base": 240000, "growth": 18.0, "ai": 2.5, "ai_rationale": "Last-mile physical delivery. AI optimizes the routing but humans do the physical delivery."},
    {"name": "Railway Engine Driver", "sector": "Transportation & Logistics", "emp_base": 100000, "wage_base": 600000, "growth": 2.0, "ai": 5.0, "ai_rationale": "Train operation. Moderate exposure to advanced signaling and automated train operation systems."},
    {"name": "Logistics Coordinator", "sector": "Transportation & Logistics", "emp_base": 1200000, "wage_base": 350000, "growth": 9.0, "ai": 7.5, "ai_rationale": "Scheduling and tracking. High exposure to AI-driven supply chain optimization and predictive routing."},

    # Financial Services
    {"name": "Bank Clerk", "sector": "Financial Services", "emp_base": 1800000, "wage_base": 400000, "growth": -1.0, "ai": 8.5, "ai_rationale": "Routine data processing and transactions. Highly exposed to digital banking and AI document processing."},
    {"name": "Accountant", "sector": "Financial Services", "emp_base": 2200000, "wage_base": 450000, "growth": 6.5, "ai": 8.0, "ai_rationale": "Financial record keeping. AI handles reconciliation and routine tax filing effectively."},
    {"name": "Financial Analyst", "sector": "Financial Services", "emp_base": 400000, "wage_base": 850000, "growth": 10.0, "ai": 8.5, "ai_rationale": "Market research and modeling. Generative AI and ML models significantly accelerate financial analysis."},
    {"name": "Insurance Agent", "sector": "Financial Services", "emp_base": 2500000, "wage_base": 350000, "growth": 4.5, "ai": 7.0, "ai_rationale": "Sales and policy advisory. Direct-to-consumer AI advisory and automated underwriting will reshape this."},

    # Public Administration
    {"name": "Police Officer", "sector": "Public Administration", "emp_base": 2500000, "wage_base": 450000, "growth": 3.0, "ai": 3.0, "ai_rationale": "Law enforcement requiring physical presence and human judgment. AI assists with surveillance and reporting."},
    {"name": "Clerk (Government)", "sector": "Public Administration", "emp_base": 4000000, "wage_base": 400000, "growth": 1.0, "ai": 8.5, "ai_rationale": "Administrative processing. High exposure to digitized workflows and automated document processing."},
    {"name": "Postal Worker", "sector": "Public Administration", "emp_base": 400000, "wage_base": 350000, "growth": -3.0, "ai": 5.0, "ai_rationale": "Mail sorting and delivery. Sorting is highly automatable, physical delivery less so."},
    {"name": "Urban Planner", "sector": "Public Administration", "emp_base": 50000, "wage_base": 700000, "growth": 7.5, "ai": 6.5, "ai_rationale": "City development planning. AI simulations and GIS analytics heavily support this knowledge work."}
]

extended_data = []

# Generate data for each state to simulate a rich dataset
for state in states:
    multiplier = 1.0 if state == "All India" else random.uniform(0.05, 0.20)
    for i, job in enumerate(occupations_data):
        # Scale employment based on state multiplier
        emp = int(job["emp_base"] * multiplier)
        if emp < 1000: emp = 1000 # Minimum floor
        
        # State-specific variations in wages and growth
        wage_mult = 1.0
        if state in ["Maharashtra", "Karnataka", "Delhi"]: wage_mult = random.uniform(1.1, 1.3)
        elif state in ["Uttar Pradesh"]: wage_mult = random.uniform(0.7, 0.9)
        
        # Base job
        extended_data.append({
            "id": f"NCO-{i+1:03d}-{state.replace(' ', '')}",
            "name": job["name"],
            "sector": job["sector"],
            "state": state,
            "employment": emp + random.randint(int(emp*-0.1), int(emp*0.1)),
            "wage": int(job["wage_base"] * wage_mult),
            "growth": round(job["growth"] + random.uniform(-1, 1), 1),
            "ai_exposure": job["ai"],
            "ai_rationale": job["ai_rationale"]
        })
        
        # Senior and Manager variants
        if job["ai"] > 5 and random.random() > 0.2:
            extended_data.append({
                "id": f"NCO-{i+1:03d}-S-{state.replace(' ', '')}",
                "name": "Senior " + job["name"],
                "sector": job["sector"],
                "state": state,
                "employment": int(emp * 0.2),
                "wage": int(job["wage_base"] * wage_mult * 1.5),
                "growth": job["growth"],
                "ai_exposure": max(0, min(10, job["ai"] - 0.5)),
                "ai_rationale": f"More strategic variant of {job['name']}. " + job["ai_rationale"]
            })
        if job["ai"] <= 5 and random.random() > 0.4:
             extended_data.append({
                "id": f"NCO-{i+1:03d}-M-{state.replace(' ', '')}",
                "name": "Supervisor - " + job["name"],
                "sector": job["sector"],
                "state": state,
                "employment": int(emp * 0.1),
                "wage": int(job["wage_base"] * wage_mult * 1.4),
                "growth": job["growth"],
                "ai_exposure": max(0, min(10, job["ai"] + 1.0)),
                "ai_rationale": f"Supervisory role for {job['name']}. Involves more reporting and coordination."
            })

# Sort by employment descending
extended_data.sort(key=lambda x: x["employment"], reverse=True)

with open("public/data.json", "w") as f:
    json.dump(extended_data, f, indent=2)

print(f"Generated {len(extended_data)} occupations across {len(states)} states and saved to public/data.json")
