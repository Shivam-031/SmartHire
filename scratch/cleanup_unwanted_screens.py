import os
import shutil

docs_base = r'c:\vs code notes\Minor Project\SmartHire\docs\stitch_screens'
public_base = r'c:\vs code notes\Minor Project\SmartHire\frontend\public\stitch_screens'

def cleanup_and_standardize(base_dir):
    career_dir = os.path.join(base_dir, 'career_prep_platform')
    if not os.path.exists(career_dir):
        print(f"Error: {career_dir} does not exist!")
        return
    
    # Files/directories to remove (unwanted old screens)
    old_items = ['html', 'images', 'all_screens.json', 'manifest_14.json', 'index.html']
    for item in old_items:
        p = os.path.join(base_dir, item)
        if os.path.exists(p):
            if os.path.isdir(p):
                shutil.rmtree(p)
                print(f"Removed old directory: {p}")
            else:
                os.remove(p)
                print(f"Removed old file: {p}")

    # Copy contents of career_prep_platform to base_dir as the standard Stitch screens
    for item in os.listdir(career_dir):
        src = os.path.join(career_dir, item)
        dst = os.path.join(base_dir, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
            print(f"Copied directory {item} to {dst}")
        else:
            shutil.copy2(src, dst)
            print(f"Copied file {item} to {dst}")

print("Cleaning docs/stitch_screens...")
cleanup_and_standardize(docs_base)

print("\nCleaning frontend/public/stitch_screens...")
cleanup_and_standardize(public_base)

print("\nCleanup completed successfully.")

