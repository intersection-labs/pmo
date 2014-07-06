require 'test_helper'

class IssueUpdatesControllerTest < ActionController::TestCase
  setup do
    @issue_update = issue_updates(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:issue_updates)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create issue_update" do
    assert_difference('IssueUpdate.count') do
      post :create, issue_update: {  }
    end

    assert_redirected_to issue_update_path(assigns(:issue_update))
  end

  test "should show issue_update" do
    get :show, id: @issue_update
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @issue_update
    assert_response :success
  end

  test "should update issue_update" do
    patch :update, id: @issue_update, issue_update: {  }
    assert_redirected_to issue_update_path(assigns(:issue_update))
  end

  test "should destroy issue_update" do
    assert_difference('IssueUpdate.count', -1) do
      delete :destroy, id: @issue_update
    end

    assert_redirected_to issue_updates_path
  end
end
