# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

Organization.delete_all
FT=Organization.create!(name: 'FT Consulting', description: 'FT Consulting offers project and programme management, application development and outsourcing services for clients in multiple industries: Banking, Insurance, Oil & Gas, Media, Retail.', domain: "www.ftconsulting.com")
Innovair=Organization.create!(name: 'Innovair', description: 'At Innovair, ideas, technology, experience and best practices come together to create ground-breaking, innovative products for the enterprise market.', domain: 'www.innovair.com')
RedFly=Organization.create!(name: 'RedFly', description: 'Advertising and Communications agency headquartered in the Golden Square, London. We serve clients in the Media and Technology sectors across the UK. Please get in touch with us through our web page, Facebook or LinkedIn!', domain: 'www.redfly.com')

Program.delete_all
Innovair_Program1=Program.create!(organization: Innovair, name: 'Program Inov8', description: 'Improve the efficiency of Innovairs HR department') 
Innovair_Program2=Program.create!(organization: Innovair, name: 'Program Inov9', description: 'Improve the program management controls which are available') 

Project.delete_all
Innovair_Project1=Project.create!(program: Innovair_Program1, name: 'Project Inov8 TSC', description: 'Improve the efficiency of Innovairs HR Talent Supply Chain department') 


