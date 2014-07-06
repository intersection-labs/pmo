class AddIssueDetails < ActiveRecord::Migration
  def self.up
    add_column :issues, :date_closed, :datetime
    add_column :issues, :status, :integer, :limit => 1
    
   end

   def self.down
     remove_column :issues, :date_closed
     remove_column :issues, :status
   end
end
