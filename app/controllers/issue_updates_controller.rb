class IssueUpdatesController < ApplicationController
  before_action :set_issue_update, only: [:show, :edit, :update, :destroy]

  # GET /issue_updates
  # GET /issue_updates.json
  def index
    @issue_updates = IssueUpdate.all
  end

  # GET /issue_updates/1
  # GET /issue_updates/1.json
  def show
  end

  # GET /issue_updates/new
  def new
    @issue_update = IssueUpdate.new
  end

  # GET /issue_updates/1/edit
  def edit
  end

  # POST /issue_updates
  # POST /issue_updates.json
  def create
    @issue_update = IssueUpdate.new(issue_update_params)

    respond_to do |format|
      if @issue_update.save
        format.html { redirect_to @issue_update, notice: 'Issue update was successfully created.' }
        format.json { render action: 'show', status: :created, location: @issue_update }
      else
        format.html { render action: 'new' }
        format.json { render json: @issue_update.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /issue_updates/1
  # PATCH/PUT /issue_updates/1.json
  def update
    respond_to do |format|
      if @issue_update.update(issue_update_params)
        format.html { redirect_to @issue_update, notice: 'Issue update was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @issue_update.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /issue_updates/1
  # DELETE /issue_updates/1.json
  def destroy
    @issue_update.destroy
    respond_to do |format|
      format.html { redirect_to issue_updates_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_issue_update
      @issue_update = IssueUpdate.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def issue_update_params
      params[:issue_update]
    end
end
