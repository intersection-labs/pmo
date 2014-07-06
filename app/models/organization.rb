class Organization < ActiveRecord::Base
  validates :name, presence: true, uniqueness: true
  has_many :programs
  before_destroy :ensure_no_related_programs
  
  
  private
    def ensure_no_related_programs
      if programs.empty?
        return true
      else
        errors.add(:base, 'Programs present, please remove first')
        return false
      end     
    end
end
