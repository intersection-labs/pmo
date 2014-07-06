json.array!(@programs) do |program|
  json.extract! program, :name, :description, :id, :created_at, :updated_at, :organization_id
  json.url program_url(program, format: :json)
end
