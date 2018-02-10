import sys
import json
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf8')(sys.stdout.buffer)
fileName = "sessions.txt"
readFile = open(fileName, 'r')
allSessions = []
thisSession = {}
lineInSession = 1
for line in readFile:
    try:
        if line.index("______") == 0:
            lineInSession = 0
            allSessions.append(thisSession)
            thisSession = {}
            thisSession["description"] = ""
    except:
        lineInSession = lineInSession
    if lineInSession == 1:
        thisSession["timeFrom"] = line[0:line.index(" -")]
        thisSession["timeTo"] = line[line.index(" - ")+3:line.index("m", line.index("-"))+1]
        thisSession["date"] = line[-2]
    if lineInSession == 2:
        thisSession["title"] = line[0:-1]
    if lineInSession == 3:
        thisSession["keywords"] = line.replace("\n","").split(", ")
    if lineInSession == 4:
        try:
            line.index("-")
            thisSession["location"] = line[0:line.rindex(" -")]
            thisSession["speakers"] = line[line.rindex(" - ") + 3:-1].split(", ")
        except:
            thisSession["location"] = line[0:-1]
            thisSession["speakers"] = []
    if lineInSession > 6:
        try:
            if(line.index("' ")==0):
                line = "\n-" + line[1:]
        except:
            None
        
    if lineInSession > 5:
        thisSession["description"] += line[0:-1] + " "
        
    
    lineInSession += 1

# speakers = []
# keywords = []
# locations = []
# for item in allSessions:
#     for keyword in item["keywords"]:
#         try:
#             keywords.index(keyword)
#         except:
#             keywords.append(keyword)
#     for speaker in item["speakers"]:
#         try:
#             speakers.index(speaker)
#         except:
#             speakers.append(speaker)
#     try:
#         locations.index(item["location"])
#     except:
#         locations.append(item["location"])
# keywords.pop(keywords.index(""))
# print(keywords)
# print(speakers)
# print(locations)

with open('sessions.json', 'w') as outfile:
    json.dump(allSessions, outfile)