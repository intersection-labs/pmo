class ChangeUpdateNameAsReservedWord < ActiveRecord::Migration
  def self.up
    remove_reference :issues, :status_types
    rename_column :issue_updates, :update, :update_description
    remove_column :issues, :update
    add_column :issues, :impact_description, :text
    add_reference :issue_updates, :status_types 
    change_column :issue_updates, :update_description, :text, :limit => nil
    
  end

  def self.down
    change_column :issue_updates, :update_description, :string
    remove_column :issues, :impact_description
    rename_column :issue_updates, :update_description, :update
    add_column :issues, :update, :string
    add_reference :issues, :status_types 
    remove_reference :issue_updates, :status_types
    
  end
end