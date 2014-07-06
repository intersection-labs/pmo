json.array!(@issues) do |issue|
  json.extract! issue, :title, :description
  json.url issue_url(issue, format: :json)
end
