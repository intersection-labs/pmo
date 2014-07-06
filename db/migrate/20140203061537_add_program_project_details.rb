class AddProgramProjectDetails < ActiveRecord::Migration
  def self.up
    add_column :programs, :purpose, :text
    remove_column :projects, :purpose, :text
    
   end

   def self.down
     remove_column :programs, :purpose
     remove_column :projects, :purpose
   end
end
