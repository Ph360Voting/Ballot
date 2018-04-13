'''
Ph-360
Excersize 1
Due: 01/22/18

Assignment: Make a linked list with the following functionality
    -add an item to head of list
    -add an item to tail of list
    -add item after a node with certain key
    -traverse list and print out items; if empty, print that
    -delete an item with certain key
    -deep copy of linked list O(n) vs O(n^2)
    -reverse the list
    -additional functionality (length method)

By: Guy Bar Yosef
'''

# node class
class Node:
    def __init__ (self, data):
        self.data = data                # data Node holds
        self.next = None                # next node in list

    def __str__(self):                  #prints out the nodes data
        return self.data

# linked list class
class linkedList:
    """
    Linked list class.

    Attributes:
        head  (Node): This is the head of the linked list
        length (int): This is the length of the list
    """

    def __init__ (self, data):
        self.head = Node(data)    # this is the head of the list
        self.length = 1           # length of the linked list

    # traverses list and prints out items
    # list can't be empty, otherwise there would be no class instance to call this method
    def printList(self):
        """Prints the data of the nodes in the list from head to tail."""
        current = self.head
        for i in range(self.length - 1):   # iterates through list until we got to the tail
            print(current, end=" -> ")     # prints out list, each node seperated by the specified 'end'
            current = current.next
        print(current)                     # tail does not point to anything (to 'None', specifically)

    # add a node to the head of the list
    def insertHead(self, key):
        """Adds a node to the front of the list with data 'key'."""
        self.length += 1          # if called, length always increments by 1
        buffer1 = Node(key)
        buffer1.next = self.head   # first make sure that the head of list doesn't get lost
        self.head = buffer1

    # add a node to the tail of the list
    def insertTail(self, key):
        """Adds a node to the end of the list with data 'key'."""
        self.length += 1         # if called, length alwqays increments by 1
        current = self.head
        while(current.next != None):  # iterating until 'current' is the tail
            current = current.next
        current.next = Node(key)     # adding node to tail

    # add a node after a node with a certain key
    def insertAtNode(self, exist, key):
        """Add a node with data 'key' after existing node with data 'exist'."""
        current = self.head
        while current != None:          #iterating through list to search for node with data 'key'
            if current.data == exist:     # found the node
                self.length += 1        # only now we know to increment the length
                buffer = Node(key)
                buffer.next = current.next
                current.next = buffer
                break
            current = current.next
        if current == None:             # we got to tail of list without finding node specified
            print("Key does not exist in list.")

    # delets item with specified data from list
    def removeNode(self, key):
        """Removes first node to have data 'key' from the list."""
        current = self.head
        buffer = current    # will serve as pointer to pervious node when we remove 'current' node
        while current != None:        # iterate through the list, head to tail
            if current.data == key:   # found node to remove
                if current == self.head:           # special case applies to head of list
                    self.head = self.head.next     # make the head of the list the 2nd node in list
                else:
                    buffer.next = current.next     # connect two ends of list to remove node
                self.length -= 1
                break               # we found node to remove, so stopping the search
            buffer = current        # buffer will be a node behind current
            current = current.next
        if current == None:         # Node to remove not in list
            print ("Node to remove with key", key, "not in list0.")

    # Deep copy of linked list with runtime O(n^2)
    # For each node in original list we go through the new list to get to the tail.
    # Therefore the number of steps will be: 1 + 2 + 3 + 4 + ... + n, giving us a runtime of O(n^2)
    def deepCopy1(self):
        """Deep Copies the list with a runtime of O(n^2)."""
        buffer1 = self.head
        newList = linkedList(buffer1.data)
        for i in range(self.length -1):         # iterates through original list, each time inserting next node to new list.
            buffer1 = buffer1.next
            newList.insertTail(buffer1.data)
        return newList

    # Deep copy of linked list with runtime O(n)
    # Reversing a list is a runtime of O(n), as we go through it once. Iterating through the list once (n steps), the insertHead method is O(1).
    # Therefore calling reversList() twice and iterating once through the list gives us O(n).
    def deepCopy2(self):
        """Deep Copies the list with runtime of O(n)."""
        self.reverseList()
        buffer1 = self.head
        newList = linkedList(buffer1.data)
        for i in range(self.length - 1):
            buffer1 = buffer1.next
            # as the list is reversed, instead of adding each node to the tail of the new list we add to the head of the new list. Runtime shortens from O(n) to O(1)
            newList.insertHead(buffer1.data)
        self.reverseList()  #brings original list back to correct order
        return newList

    # reverses the order of the list
    def reverseList(self):
        """Reverses the order of the list."""
        buffer1 = self.head
        # as original list gets iterated from head to tail, we keep adding to head of new list, building it from right to left and thereby reversing it
        newList = linkedList(buffer1.data)   # head of original list will become tail of new list
        for i in range(self.length - 1):
            buffer1 = buffer1.next
            newList.insertHead(buffer1.data)
        self.head = newList.head

    # returns the length of the linked list
    def listLength(self):
        """Returns the length of the list."""
        return self.length


'''
Examples using the linked list class above
'''
def main():

    help(linkedList)

    # adding 10 nodes to list - after each addition, print out list to see the affect
    print("Adding 10 nodes to list, printing updated list each time: ")
    list0 = linkedList("Head!")
    list0.printList()
    list0.insertTail("Tail!")
    list0.printList()
    list0.insertHead("NewHead!")
    list0.printList()
    list0.insertAtNode("Head!", "Alice")
    list0.printList()
    list0.insertAtNode("Tail!", "Zebra")
    list0.printList()
    list0.insertAtNode("Alice", "Bob")
    list0.printList()
    list0.insertHead("BabyBoss")
    list0.printList()
    list0.insertAtNode("Bob", "Wagamama")
    list0.printList()
    list0.insertTail("Taylor")
    list0.printList()
    list0.insertAtNode("Alice", "John")
    list0.printList()

    # printing the length of the list
    print("\nList length:", list0.listLength());

    # removing some nodes and reprinting update list and its length
    print("\nRemoving head node, a node in the middle, and tail node:")
    list0.removeNode("BabyBoss")
    list0.removeNode("Head!")
    list0.removeNode("Taylor")
    list0.printList()
    print("\nNew list length:", list0.listLength());

    # reverses list and prints the updated list
    print("\nReversing List: ")
    list0.reverseList()
    list0.printList()

    # deep copies the list in the two ways
    print("\nDeep copying List:")
    list2 = list0.deepCopy1()
    list3 = list0.deepCopy2()
    print("Original list: ", end="")
    list0.printList()
    print("New list 1: ", end="")
    list2.printList()
    print("New list 2: ", end="")
    list3.printList()

    # Shows that this was indeed a deep copy by altering original list and then printing out all 3 lists
    print("\nRemoving tail from original list: ", end="")
    list0.removeNode("NewHead!")
    list0.printList()
    print("But new list 1 is unchanged: ", end="")
    list2.printList()
    print("As is list 2: ", end="")
    list3.printList()


if __name__ == "__main__":
    main()
