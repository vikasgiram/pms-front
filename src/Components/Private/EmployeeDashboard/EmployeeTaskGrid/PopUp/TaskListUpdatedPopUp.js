import { useState } from "react";
import toast from "react-hot-toast";
import { formatDate, formatDateforTaskUpdate, formatDateforEditAction } from "../../../../../utils/formatDate";
import { Steps } from "rsuite";
import { createAction, getAllActions } from "../../../../../hooks/useAction";
import { updateAction } from "../../../../../hooks/useAction";
import { RequiredStar } from "../../../RequiredStar/RequiredStar";

const TaskListUpdatedPopUp = ({ handleUpdateTask, selectedTask }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [taskLevel, setTaskLevel] = useState(selectedTask?.taskLevel);
  const [taskStatus, setTaskStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [action, setAction] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [actionHistory, setActionHistory] = useState();
  const [forEdit, setForEdit] = useState(false);
  const [editAction, setEditAction] = useState(""); //editAction used for for  update as parameter 
  const [addAction, setAddAction] = useState(true);
  
  console.log(selectedTask, "selected task");

  const handleStatusChange = (status) => {
    setTaskStatus(status);

    if (status === "completed") {
      setTaskLevel(100);
    }
    else if (status === "inprocess" || status === "stuck") { 
      setTaskLevel((prev) => (parseInt(prev) < 100 ? prev : ""));
    } else {
      setTaskLevel("");
    }
  };

  const toggleVisibility = async () => {
    const res = await getAllActions(selectedTask._id);
    setActionHistory(res?.actions);
    setIsVisible(!isVisible);
  };

  const handelTaskUpdate = async (event) => {
    event.preventDefault();
    if (taskStatus === "completed") {
      setTaskLevel(100); 
    }
    if (
      !action ||
      !startTime ||
      !endTime ||
      !taskLevel ||
      !taskStatus
    ) {
      return toast.error("Please fill all fields");
    }
    if (taskLevel > 100) {
      return toast.error("Task level should be less than 100");
    } else if (taskLevel < selectedTask?.taskLevel) {
      return toast.error("Task level must be greater than previous task level");
    }
    if (!/^[a-zA-Z0-9\s.,;:!?'"()\-]+$/.test(action)) {
      return toast.error("Special characters are not allowed in action");
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      return toast.error("Start time must be before end time");
    }

    const data = {
      task: selectedTask?._id,
      action,
      startTime,
      endTime,
      taskLevel: taskStatus === "completed" ? 100 : taskLevel,
      taskStatus,
      remark,
    };

    try {
      await createAction(data);
      handleUpdateTask();
    } catch (error) {
      toast.error(error);
    }
  };

  const editTask = (action) => {
    setEditAction(action);
    setForEdit(true);
    setAddAction(false);
  }

  const handleEditTask = (event) => {
    const { name, value } = event.target;

    if (name === "taskStatus") {
      if (value === "completed") {
        setEditAction((prevAction) => ({
          ...prevAction,
          taskStatus: value,
          complated: "100",
        }));
      } else {
        setEditAction((prevAction) => ({
          ...prevAction,
          taskStatus: value,
          complated: "",
        }));
      }
      return;
    }

    if (name === "complated") {
      if (editAction.taskStatus !== "completed") {
        if (value === "" || /^\d{1,2}$/.test(value)) {
          if (value === "" || parseInt(value) <= 100) {
            setEditAction((prevAction) => ({
              ...prevAction,
              complated: value,
            }));
          }
        }
      }
      return;
    }

    setEditAction((prevAction) => ({
      ...prevAction,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!editAction.action || !editAction.startTime || !editAction.endTime || 
        !editAction.complated || !editAction.taskStatus) {
      return toast.error("Please fill all required fields");
    }
    
    if (editAction.complated > 100) {
      return toast.error("Completed level should be less than or equal to 100");
    }
    
    // Validate dates for edit
    if (new Date(editAction.startTime) >= new Date(editAction.endTime)) {
      return toast.error("Start time must be before end time");
    }

    try {
      await updateAction(editAction._id, editAction);
      handleUpdateTask();
    } catch (error) {
      toast.error(error);
    }
  }

  return (
    <>
      <div
        className="modal fade show"
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#00000090",
        }}
      >
        <div className="modal-dialog modal-xl modal_widthhh" >
          <div className="modal-content p-3">
            <form>
              <div className="modal-header pt-0">
                <h5 className="card-title fw-bold" id="exampleModalLongTitle">
                  {selectedTask?.taskName?.name}
                </h5>
                <button
                  onClick={() => handleUpdateTask()}
                  type="button"
                  className="close px-3"
                  style={{ marginLeft: "auto" }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <span className="">
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: selectedTask?.taskLevel + "%" }}
                          aria-valuenow="50"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {selectedTask?.taskLevel &&
                            selectedTask?.taskLevel + "%"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Steps current={2}>
                    <Steps.Item
                      title={formatDate(selectedTask?.startDate)}
                    />
                    <Steps.Item
                      title={
                        actionHistory && actionHistory?.length > 0
                          ? formatDate(
                            actionHistory[
                              actionHistory.length - 1
                            ].endTime
                          )
                          : "No actions performed"
                      }
                    />
                  </Steps>
                </span>

                <div className="row modal_body_height mt-2 " style={{ maxWidth: '60vw', width: '60vw' }}>                 
                   <div className="col-20 col-lg-20 align-items-center">

                  <div className="d-flex justify-content-end mt-3">
                   <button type="button" className={`btn btn-sm rounded-0 add_button px-4 me-3 text-white ${
                   isVisible ? 'btn-danger' : 'btn-success'
                   }`}
                   onClick={toggleVisibility}
                   >
                   {isVisible ? 'x' : 'Show More...'}
                   </button>
                  </div>

                  {isVisible && (
                    <div className="  bg-white ms-1 rounded p-lg-3">
                      <div className="col-12" style={{ maxWidth: '55vw', width: '55vw' }}>
                        <div className="shadow_custom ">
                          <div className="table-responsive">
                            <table className="table align-items-center table-flush" >
                              <thead className="thead-light" >
                                <tr >
                                  <th className="text-center">Action</th>
                                  <th className="text-center">Action By</th>
                                  <th className="text-center">Start Date</th>
                                  <th className="text-center">End Date</th>
                                  <th className="text-center">Completed</th>
                                  <th className="text-center">Edit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {console.log("actionHistory", actionHistory)}
                                {actionHistory &&
                                  actionHistory.map((action, index) => (
                                    <tr className="text-center" key={action?._id} >
                                      <td>{action?.action}</td>
                                      <td>{action?.actionBy?.name}</td>
                                      <td>{formatDateforTaskUpdate(action?.startTime)}</td>
                                      <td>{formatDateforTaskUpdate(action?.endTime)}</td>
                                      <td>{action?.complated}%</td>
                                      <td>  {index ===
                                        actionHistory.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() => editTask(action)}
                                          >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                          </button>
                                        )}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                  {/* for edit the actions */}
                  {forEdit ? (
                    <div className="row modal_body_height mt-2">
                      <div className="col-12 col-lg-12 ">
                        <div className="md-3">
                          <label
                            htmlFor="action"
                            className="form-label label_text "
                          >
                            Action <RequiredStar/>
                          </label>
                          <textarea
                            className="textarea_edit col-12"
                            id="action"
                            name="action"
                            rows="2"
                            maxLength={300}
                            onChange={handleEditTask}
                            value={editAction?.action}
                            required
                          ></textarea>
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="mb-3">
                          <label
                            htmlFor="startTime"
                            className="form-label label_text"
                          >
                            Process Start Date <RequiredStar/>
                          </label>
                          <input
                            type="datetime-local"
                            name="startTime"
                            onChange={handleEditTask}
                            value={formatDateforEditAction(editAction?.startTime)}
                            className="form-control rounded-0"
                            id="startTime"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="mb-3">
                          <label
                            htmlFor="endTime"
                            className="form-label label_text"
                          >
                            Process End Date <RequiredStar/>
                          </label>
                          <input
                            type="datetime-local"
                            name="endTime"
                            onChange={handleEditTask}
                            value={formatDateforEditAction(editAction?.endTime)}                 
                            className="form-control rounded-0"
                            id="endTime"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <label
                          htmlFor="taskStatus"
                          className="form-label label_text"
                        >
                          Status <RequiredStar/>
                        </label>
                        <select
                          id="taskStatus"
                          name="taskStatus"
                          className="form-select"
                          onChange={handleEditTask}
                          value={editAction?.taskStatus}
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="inprocess">In Process</option>
                          <option value="completed">Completed</option>
                          <option value="stuck">Stuck</option>
                        </select>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="">
                          <label
                            htmlFor="complated"
                            className="form-label label_text"
                          >
                            Completed Level <RequiredStar/>
                          </label>
                          <div className="input-group border mb-3">
                            <input
                             type="text"
                             name="complated"
                             maxLength={3}
                             onChange={handleEditTask}
                             value={editAction?.complated}
                             className="form-control rounded-0 border-0"
                             id="complated"
                             placeholder="eg. 65 %"
                             readOnly={editAction.taskStatus === "completed"} 
                             required
                            />
                            <span
                              className="input-group-text rounded-0 bg-white border-0"
                              id="basic-addon1"
                            >
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-lg-12">
                        <div className="mb-3">
                          <label htmlFor="remark" className="form-label label_text">
                            Remark
                          </label>
                          <textarea
                            className="textarea_edit col-12"
                            id="remark"
                            name="remark"
                            placeholder="Remark ..."
                            maxLength={300}
                            rows="2"
                            onChange={handleEditTask}
                            value={editAction?.remark}
                          ></textarea>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12 pt-3 mt-2">
                          <button
                            type="submit"
                            onClick={handleSubmit}
                            className="w-80 btn addbtn rounded-0 add_button m-2 px-4"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateTask}
                            className="w-80 btn addbtn rounded-0 Cancel_button m-2 px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : ""}

                  {selectedTask?.taskLevel !== 100 && addAction && (
                    <div className="row modal_body_height mt-2">
                      <div className="col-12 col-lg-12 ">
                        <div className="md-3">
                          <label
                            htmlFor="Action"
                            className="form-label label_text "
                          >
                            Action  <RequiredStar/>
                          </label>
                          <textarea
                            className="textarea_edit col-12"
                            id="Action"
                            name="Action"
                            placeholder="Details ..."
                            maxLength={300}
                            rows="2"
                            onChange={(e) => { setAction(e.target.value) }}
                            value={action}
                          ></textarea>
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="mb-3">
                          <label
                            htmlFor="processStartDate"
                            className="form-label label_text"
                          >
                            Process Start Date  <RequiredStar/>
                          </label>
                          <input
                            type="datetime-local"
                            name="processStartDate"
                            onChange={(e) => {
                              setStartTime(e.target.value);
                            }}
                            value={startTime}
                            className="form-control rounded-0"
                            id="processStartDate"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="mb-3">
                          <label
                            htmlFor="processEndDate"
                            className="form-label label_text"
                          >
                            Process End Date   <RequiredStar/>
                          </label>
                          <input
                            type="datetime-local"
                            name="processEndDate"
                            onChange={(e) => setEndTime(e.target.value)}
                            value={endTime}
                            className="form-control rounded-0"
                            id="processEndDate"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <label
                          htmlFor="projectStatus"
                          className="form-label label_text"
                        >
                          Status <RequiredStar/>
                        </label>
                        <select
                          id="projectStatus"
                          name="projectStatus"
                          className="form-select"
                          onChange={(e) => handleStatusChange(e.target.value)}
                          value={taskStatus}
                        >
                          <option value="">Select Status</option>
                          <option value="inprocess">In Process</option>
                          <option value="completed">Completed</option>
                          <option value="stuck">Stuck</option>
                        </select>
                      </div>

                      <div className="col-12 col-lg-3 mt-2">
                        <div className="">
                          <label
                            htmlFor="completedLevel"
                            className="form-label label_text"
                          >
                            Completed Level <RequiredStar/>
                          </label>
                          <div className="input-group border mb-3">
                            <input
                              type="text"
                              name="completedLevel"
                              maxLength={3}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string or valid numbers (including during deletion)
                                if (taskStatus !== "completed" && (value === "" || /^\d{1,3}$/.test(value))) {
                                  // Additional check to ensure value doesn't exceed 100
                                  if (value === "" || parseInt(value) <= 100) {
                                    setTaskLevel(value);
                                  }
                                }
                              }}
                              value={taskLevel}
                              className="form-control rounded-0 border-0"
                              id="completedLevel"
                              placeholder="eg. 65 %"
                              aria-label="Completed Level"
                              readOnly={taskStatus === "completed"}
                            />
                            <span
                              className="input-group-text rounded-0 bg-white border-0"
                              id="basic-addon1"
                            >
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-lg-12">
                        <div className="mb-3">
                          <label htmlFor="remarkField" className="form-label label_text">
                            Remark
                          </label>
                          <textarea
                            className="textarea_edit col-12"
                            id="remarkField"
                            name="remarkField"
                            placeholder="Remark ..."
                            maxLength={300}
                            rows="2"
                            onChange={(e) => setRemark(e.target.value)}
                            value={remark}
                          ></textarea>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-12 pt-3 mt-2">
                          <button
                            type="submit"
                            onClick={handelTaskUpdate}
                            className="w-80 btn addbtn rounded-0 add_button m-2 px-4"
                          >
                            Submit Work
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateTask}
                            className="w-80 btn addbtn rounded-0 Cancel_button m-2 px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskListUpdatedPopUp;