'''
Ph-360
Week 1, HW 1
Due: 01/18/18

Assignment: Make a linked list && a hash function

By: Guy Bar Yosef
'''

#Double linked list
# node class
class Node:
    def __init__ (self, info, previousNode = None):
        self.info = info                # info Node holds
        self.next = None                # next node in list
        self.previous = previousNode    # previous node in list

    def __str__(self):                  #prints out the nodes number and info
        return "Node info: %s" % ( self.info )

# linked list class
class linkedList:
    def __init__ (self, info):
        self.head = Node(info)    # this is the head of the list
        self.length = 1           # length of the linked list

    # add a node to the end of the list
    def addNode(self, info):
        self.length += 1
        current = self.head
        while current.next != None:  # iterate through list until reaching last node
            current = current.next
        current.next = Node(info, current) # add node to end of list

    # remove a node matching the 'info' provided from the list
    def removeNode(self, info):
        current = self.head
        while current != None:                     # iterate all the way through the list, head to tail
            if current.info == info:               # found node to remove
                if current == self.head:        # this is the head of the list
                    self.head = self.head.next     # make the head of the list the next node in list
                    self.head.previous = None      # Head of list does not have a node before it
                else:                           # Node to remove is not end of list
                    current.previous.next = current.next   # connect two ends of list to remove node
                self.length -= 1
                break       # if we found such a node, stop the search
            current = current.next
        if current == None:                     # Node to remove not in list
            print ("Node not found :(")


    # print the whole list, in order from head to tail
    def printList(self):
        current = self.head
        while current != None:
            print(current)
            current = current.next

    # returns the length of the linked list
    def listLength(self):
        return self.length



#simple hash function, just gives an adequate, pseudorandom, even distribution across table
def hashFunc(input, tablesize):
    sum = 0
    for i in range( len(input) ):
        sum += 17**(ord(input[i]))
    return (sum % tablesize)      # verifies that output will fit into hashtable

# HashTable class, using seperate chaining to deal with collisions
class HashTable:
    def __init__ (self, size):
        self.size = size            #the size of the table
        self.table = [None]*size    # initializes a list of 'size' elements to 'None'

    # adds a value to the hashtable, by way of seperate chaining
    def addValue(self, value):
        hashvalue = hashFunc(value, self.size)         # get the hash of the value we are adding
        if self.table[hashvalue] == None:              # if this is the first value to be added to the index in table
            self.table[hashvalue] = linkedList(value)  # start a linkedlist at index
        else:
            self.table[hashvalue].addNode(value)       # otherwise add Node to exsisting linked list

    # prints out the HashTable
    def printTable(self):
        print("Printing table: ")
        for i in range( self.size ):
            if self.table[i] != None:         #can't print 'None', so skip those
                print("In index", i, "is: ", end="")
                self.table[i].printList()



'''
Just some quick examples using the code above
'''
def main():
    #dealing with the linked list
    list1 = linkedList("I am the head")
    list1.addNode("I am second")
    list1.addNode("I am the last")

    print("Printing list: ")
    list1.printList()

    print("\nNow trying to remove 'Blah': ", end="")
    list1.removeNode("Blah")
    print("\nNow removing 'I am second'.")
    list1.removeNode("I am second")

    print("\nPrinting list: ")
    list1.printList()

    print("List length: ", list1.listLength() )


    #dealing with the hashfunction
    print("\n\n")
    table = HashTable(100)
    table.addValue("Wagamama")
    table.addValue("Guy Bar Yosef")
    table.addValue("Party in the house")
    table.addValue("this is crazy fun")
    table.addValue("pie is 3.14 ya di da di da")
    table.addValue("Who, hooo!")
    table.addValue("this is the end i think")
    table.printTable()


if __name__ == "__main__":
    main()
