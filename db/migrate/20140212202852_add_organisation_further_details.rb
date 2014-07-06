class AddOrganisationFurtherDetails < ActiveRecord::Migration
  def self.up
    add_column :organizations, :number_of_users, :integer
    
   end

   def self.down
     remove_column :organizations, :number_of_users
   end
end
