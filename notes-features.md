### Healey's To-do list

- [ ] bindery calculator links
- [ ] commercial invoice
- [ ] net terms etc
### Existing Platinum Functionality, New Location 
- scan history/scan detail history
- interior boards
- job shipping addresses
	- i compacted the table pretty significantly for simple viewing
	- i think this table should also include the filter functionality from the customer job list table
		- columns with freeform values should be sortable
		- columns with set values should be filterable
		- added the ability to hide columns to make comparison and data validation simpler
		- bulk actions happen from the footer, and then open the aside
			- that way, we can enforce any carrier / account / method weirdness
		- i think  this is the component i want to go with moving forward for all tables

### Trello
- sean and i have already had a conversation about how we can go crazy style on this trello integration

    ![the POSSIBILITIES](https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aHQyaTNnNTF4bWR0MXl4YXdtN2k5bDI2dDljZHJxYjU0aWowa3J4MiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/idFxmiV2dayJEqzXaW/giphy.gif)

### Job Contacts
- reimagined proof-to, bill-to, and ship-notify
- the way i have it set up right now is that you can assign the same email to multiple contact roles

### Notes
- basically existing gold functionality

### Activity Log
- this combines scan history, scan detail history and the job scanner app
- we can restrict the 'search to update status' just to creative, because it seems like they are the only ones that use that digitally.... 
- is the bug that makes it so updating the status from the interface doesnt actually update the scan history still exist? can we fix that with this?

### Production
- Production inputs have been broken up into 5 sections in the modal
	- General
	- Paper
	- Print Finishing
	- Bindery Finishing
	- Interior Boards
- if these sections have values, they should also display on the card body