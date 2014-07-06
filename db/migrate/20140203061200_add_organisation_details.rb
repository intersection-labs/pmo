class AddOrganisationDetails < ActiveRecord::Migration
  def self.up
    add_column :organizations, :domain, :string
   end

   def self.down
     remove_column :organizations, :domain
   end
end