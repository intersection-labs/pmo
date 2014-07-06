class SetupProjectRelationships < ActiveRecord::Migration
  def self.up
    add_reference :programs, :organization
    remove_reference :programs, :project    
    add_reference :projects, :program
    remove_reference :issues, :program
    add_reference :issues, :project
    remove_reference :projects, :issues
    
  end

  def self.down
     remove_reference :programs, :organization
      add_reference :programs, :project
      remove_reference :projects, :program
      add_reference :issues, :program
      remove_reference :issues, :project
      add_reference :projects, :issues
    
  end
end
