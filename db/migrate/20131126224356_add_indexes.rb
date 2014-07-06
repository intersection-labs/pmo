class AddIndexes < ActiveRecord::Migration
  def self.up
    add_index :issues, :project_id
    add_index :projects, :program_id
    add_index :programs, :organization_id
    add_index :issue_updates, :issues_id
    
  end

  def self.down
    remove_index :issues, :project_id
    remove_index :projects, :program_id
    remove_index :programs, :organization_id
    remove_index :issue_updates, :issues_id
    
  end
end