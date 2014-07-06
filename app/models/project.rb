class Project < ActiveRecord::Base
  belongs_to :program
  
  has_many :issues
  
end
