class CreateTypeTables < ActiveRecord::Migration
  def self.up
    create_table :issue_types, :force => true do |t|
      t.string :name
      t.timestamps
    end
    
    create_table :status_types, :force => true do |t|
      t.string :name
      t.timestamps
    end
  end

  def self.down
    drop_table :status_types
    drop_table :issue_types
  end
end