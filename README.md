# Problem:

Consider a CSV file persisted on S3 with columns PostalCode, City, Street, and StreetNumber. Consider additionally you have a REST API that lets you query that file using S3 Select.

The user specifies column values to query via query string: `?postalcode=1234`
Each line on the file represent a rule.

A line with:
12000, Berlin, street a, 123

If the user queries using all of those values, he gets a match.

# Challenge:

If we have a rule:
12000, Berlin,,,

Means street and street number can match any street or street number => Greedy Match.

Come up with a way to enable a user to match the rule: 12000, Berlin, when we provides as input:
12000, Berlin, street abc, 123
