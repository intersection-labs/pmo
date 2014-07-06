json.array!(@issue_updates) do |issue_update|
  json.extract! issue_update, 
  json.url issue_update_url(issue_update, format: :json)
end
