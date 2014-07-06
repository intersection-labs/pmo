class StaticController < ApplicationController
  layout "static", :only => "about" 
  layout "dashboard", :only => "dashboard" 
  layout "dashboard1", :only => "dashboard1" 
   
  def dashboard
    @programs=Program.count
  end
  
  def dashboard1
    @organizations=Organization.all
    render(:layout => "layouts/dashboard1")
  end
  
  def about
    
  end
  
  def whatwedo
    
  end
  
  def landing 
  
  end
end
