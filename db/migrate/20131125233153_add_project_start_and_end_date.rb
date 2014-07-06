class AddProjectStartAndEndDate < ActiveRecord::Migration
  def self.up
    add_column :projects, :start_date, :datetime
    add_column :projects, :planned_end_date, :datetime
    
  end

  def self.down
    remove_column :projects, :start_date
    remove_column :projects, :planned_end_date
    
  end
end