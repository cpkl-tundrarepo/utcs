import os
import json

ignore_list = ["data.json", "markdown.md"]
ignore_format = ["title", "json", "py"]
image_format = ["jpg", "png", "jpeg"]

def get_title(path):
    print("getting title for "+path)
    title = path.split(".")
    print(title)
    if (len(title) > 2):
        title = title[:-1]
    title = ".".join(title)
    print("this")
    print(title)
    print("will look for "+title+".title")
    
    if (os.path.isfile(title+".title")):
        with open(title+".title") as file:
            print(title+".title")
            return file.read()
    else:
        return False


def loop_through(directory, path):
    this_object = {directory: {'type': 'directory', 'subelements':{}}};
    response = next(os.walk(path+directory), False)
    print("looping through "+directory)
    print(response)
    print(path)
    if response:
        print("====reponse subdir for "+directory)
        title = get_title(path+directory)
        if (title):
            this_object[directory]['title'] = title
        else:
            this_object[directory]['title'] = directory 
        for subdir in response[1]:
            print("this is a sub dir of "+directory)
            print(subdir)
            complete_object = loop_through(subdir, path+directory+"/")
            if (path == '.'):
                with open("./"+subdir+"/data.json","w") as file:
                    file.write(json.dumps({'subelements': complete_object[subdir]['subelements']}, indent=4, sort_keys=True))
            this_object[directory]['subelements'][subdir] = complete_object[subdir]
        print("====reponse subfile for "+directory)
        for subfile in next(os.walk(path+"/"+directory))[2]:
            print(subfile)
            if subfile not in ignore_list and subfile.split(".")[-1] not in ignore_format:
                if subfile.split(".")[-1] in image_format:
                    this_object[directory]['subelements'][subfile] = {'type':'image'}
                else:
                    this_object[directory]['subelements'][subfile] = {'type':'file'}
                subtitle = get_title(path+directory+"/"+subfile)
                if (subtitle):
                    this_object[directory]['subelements'][subfile]['title'] = subtitle
                else:
                    this_object[directory]['subelements'][subfile]['title'] = subfile
            elif subfile == "markdown.md":
                this_object[directory]['type'] = 'document'
    return this_object 

loop_through('','.')
print("finished, leaving...")
