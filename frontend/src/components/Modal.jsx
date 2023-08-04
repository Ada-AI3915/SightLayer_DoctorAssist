// the Modal component takes in several props: title, role, setRole, modalStatus, and setModalStatus.
// these props are used to control the behavior and appearance of the modal component.
export default function Modal({
  title,
  role,
  setRole,
  modalStatus,
  setModalStatus,
}) {
  return (
    <div
      className={
        modalStatus
          ? `h-full w-full absolute flex items-center justify-center bg-white bg-opacity-0 backdrop-blur-sm transition-all`
          : "hidden"
      }
    >
      <div className="h-62 w-[382px] p-8 flex items-center flex-col bg-white gap-2 transition-all">
        <h1 className="font-bold text-[32px] text-blue-600">{title}</h1>
        <div className="relative w-full flex items-center h-20">
          {/* represents the radio button for the clinician role. */}
          <div className="w-[50%]">
            <input
              type="radio"
              name="role"
              id="clinician"
              checked={role === "clinician"}
              onChange={() => setRole("clinician")}
            />
            <label htmlFor="clinician" className="pl-2 text-xl">
              Clinician
            </label>
          </div>
          {/* represents the radio button for the patient role. */}
          <div className="w-[50%] text-right">
            <input
              type="radio"
              name="role"
              id="patient"
              checked={role === "patient"}
              onChange={() => setRole("patient")}
            />
            <label htmlFor="patient" className="pl-2 text-xl">
              Patient
            </label>
          </div>
        </div>
        <div className="relative w-full flex items-center">
          {/* triggers the connection action when clicked. if the role is not empty, the setModalStatus function is called to close the modal. */}
          <button
            onClick={() => {
              if (role !== "") setModalStatus(false);
            }}
            className="w-[100%] h-10 bg-blue-600 text-white text-xl"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
