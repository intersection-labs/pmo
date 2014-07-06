class Program < ActiveRecord::Base
  belongs_to :organization
  has_many :projects
  
  validates :name, presence: true, uniqueness: true
end
