class Issue < ActiveRecord::Base
    belongs_to :project
    has_many :issue_updates
    
    
    validates_presence_of :title, :message => "We need a title to xxx"
    validates_presence_of :description, :message => "We need a description to xxx"
    
    validates :status, inclusion: { in: %w(open closed) },
                         presence: true 
end
