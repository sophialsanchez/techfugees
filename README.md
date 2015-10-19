# techfugees

A python script to find all possible paths between two countries and the associated travel cost using the GITOC database.

# Example

input:

listAllCountryPaths('Niger', 'Italy')

output:

There are 6 trips in our database from Niger to Italy. The paths are:

['Niger', 'Libya', 'Italy'] Trip price: 510

['Niger', 'Libya', 'Italy'] Trip price: 1130

['Niger', 'Libya', 'Italy'] Trip price: 370

['Niger', 'Libya', 'Italy'] Trip price: 990

['Niger', 'Libya', 'Italy'] Trip price: 135

['Niger', 'Libya', 'Italy'] Trip price: 755


NOTE: The code counts individual trips. In the above case, there were 3 people in the database who did Niger->Libya, and two people who did Libya->Italy, which is why you get 6 possible trips with the same path but all with different prices.
