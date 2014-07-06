class AmendIssueTable < ActiveRecord::Migration
  def self.up
    add_reference :issues, :issue_types 
    add_reference :issues, :status_types 
    add_column :issues, :target_resolution_date, :datetime
    add_column :issues, :update, :datetime
  end

  def self.down
    remove_column :issues, :target_resolution_date
    remove_column :issues, :issue_types
    remove_column :issues, :status_types
  end
end