from pymongo import MongoClient
client = MongoClient("mongodb+srv://Jaazib:Jt2006@mesh.ttoh4.mongodb.net/?retryWrites=true&w=majority&appName=Mesh")
db = client["Users"]
collection = db["Users"]

class User:
    def __init__(self, name, age, skills=None, experience=None, interests=None):
        self.name = name
        self.age = age
        self.skills = skills
        self.experience = experience
        self.interests = interests

    def save(self):
        collection.insert_one(self.__dict__)



