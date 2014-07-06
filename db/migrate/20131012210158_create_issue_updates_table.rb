class CreateIssueUpdatesTable < ActiveRecord::Migration
  def self.up
    create_table :issue_updates, :force => true do |t|
      t.string :update
      t.timestamps
    end
    
    add_reference :issue_updates, :issues
  end

  def self.down
    drop_table :issue_updates
  end
end