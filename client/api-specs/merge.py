import json
from urllib.parse import urljoin

# 🔹 Input files
files = ["resume.json","quiz.json","auth.json","jobs.json","news.json","mentorship.json","resumebuilder.json","ai_interview.json"]

# 🔹 Initialize merged spec
merged_spec = {
    "openapi": "3.1.0",
    "info": {"title": "Merged API", "version": "1.0.0"},
    "paths": {},
    "components": {}
}

def load_spec(path):
    with open(path, "r") as f:
        return json.load(f)

for file in files:
    spec = load_spec(file)
    servers = spec.get("servers", [])
    base_url = servers[0]["url"] if servers else ""

    # 🔹 Merge paths with server URL prepended
    for path, path_item in spec.get("paths", {}).items():
        new_path = urljoin(base_url + "/", path.lstrip("/")) if base_url else path
        if new_path in merged_spec["paths"]:
            print(f"Warning: duplicate path {new_path} from {file}")
        merged_spec["paths"][new_path] = path_item

    # 🔹 Merge components
    for comp_type, comp_defs in spec.get("components", {}).items():
        merged_spec["components"].setdefault(comp_type, {})
        for name, definition in comp_defs.items():
            if name in merged_spec["components"][comp_type]:
                print(f"Warning: duplicate component {comp_type}.{name} from {file}")
            merged_spec["components"][comp_type][name] = definition

# 🔹 Save merged spec
with open("merged.json", "w") as f:
    json.dump(merged_spec, f, indent=2)

print("Merged OpenAPI 3.1 spec saved as merged.json")
