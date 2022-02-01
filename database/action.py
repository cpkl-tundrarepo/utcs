import os
import json
import sys

ignore_list = ["data.json", "markdown.md"]
ignore_format = ["title", "json", "py"]
image_format = ["jpg", "png", "jpeg"]

def parse_file(path):
    #print("getting title for "+path)
    title = path.split(".")
    #print(title)
    if (len(title) > 2):
        title = title[:-1]
    title = ".".join(title)
    #print("this")
    #print(title)
    print("will look for "+title+".title")
    
    if (os.path.isfile(title+".title")):
        with open(title+".title") as file:
            #print("it who we are")
            #print(title+".title")
            dictionary = {}
            format = file.read().split("\n")
            for line in format:
                params = line.split(":")
                if len(params) >= 2:
                    if (params[1][0] == " "):
                        params[1] = params[1][1:]
                    #print(f"{title}[{params[0].lower()}] = {params[1]}")
                    dictionary[params[0].lower()] = params[1]
            print(dictionary)
            return dictionary
    else:
        return False

def define_json(path, directory, isSub):
    current_element = parse_file(path)
    if (current_element):
        if "type" not in current_element:
            if directory.split(".")[-1] in image_format:
                current_element['type'] = 'image'
            elif isSub:
                current_element['type'] = 'file'
            else:
                current_element['type'] = 'directory'
        if "title" not in current_element:
            current_element['title'] = directory
        if not isSub:
            current_element['subelements'] = {}
        return current_element
    else:
        return {'type': 'directory', 'subelements':{}}

def loop_through(directory, path):
    this_object = {directory: define_json(path+directory, directory, False)};
    response = next(os.walk(path+directory), False)
    if response:
        for subdir in response[1]:
            complete_object = loop_through(subdir, path+directory+"/")
            if (path == '.'):
                with open("./"+subdir+"/data.json","w") as file:
                    file.write(json.dumps({'subelements': complete_object[subdir]['subelements']}, indent=4, sort_keys=True))
            this_object[directory]['subelements'][subdir] = complete_object[subdir]
        for subfile in next(os.walk(path+"/"+directory))[2]:
            if subfile not in ignore_list and subfile.split(".")[-1] not in ignore_format:
                this_object[directory]['subelements'][subfile] = define_json(path+directory+"/"+subfile, subfile, True)
            elif subfile == "markdown.md":
                if 'type' not in this_object[directory] or this_object[directory]['type'] == 'directory':
                    this_object[directory]['type'] = 'document'
    return this_object 

loop_through('','.')
print("finished, leaving...")
sys.exit(0)
