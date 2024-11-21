'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/lib/config";
import { cn } from "@/lib/utils";

interface SettingProps {
  user: any;
}

const Setting: React.FC<SettingProps> = ({ user }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageInfo, setMessageInfo] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [messageTypeInfo, setMessageTypeInfo] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const [isDataLoading, setIsDataLoading] = useState(true);


  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsDataLoading(true);

      try {
        const response = await axios.get(`${API}/superAdmin/setting/personal/${user.email}`);
        setFullName(response.data.name);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phoneNumber);
      } catch (error) {
        console.error("Error fetching user details", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserDetails();
  }, [user.email]);

  const handleUpdateProfile = async () => {
    setLoadingInfo(true);
    try {


      // Update user profile with the new signature URL
      const response = await axios.patch(
        `${API}/superAdmin/setting/personal/${user.email}`,
        {
          name: fullName,
          email,
          phoneNumber,
        }
      );

      setMessageInfo(response.data.message);
      setMessageTypeInfo("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessageInfo(error.response.data.message);
        setMessageTypeInfo("error");
      } else {
        console.error("Error updating info", error);
        setMessageInfo("An error occurred while updating info.");
        setMessageTypeInfo("error");
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${API}/superAdmin/setting/password/${user.email}`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        }
      );
      setMessage(response.data.message);
      setMessageType("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message);
        setMessageType("error");
      } else {
        console.error("Error changing password", error);
        setMessage("An error occurred while changing the password.");
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Profile Info</h2>
        {isDataLoading ? (
          <div className="flex flex-col">
            <div className="mt-1 w-full h-10 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="mt-1 w-full h-10 bg-gray-300 animate-pulse rounded-md"></div>
            <div className="mt-1 w-full h-10 bg-gray-300 animate-pulse rounded-md"></div>
          </div>) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProfile();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  { "border-red-500": email.length > 0 }
                )}
              />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className={cn(
                "mt-4 bg-red-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-red-600",
                {
                  "cursor-not-allowed bg-gray-500 hover:bg-gray-500":
                    loadingInfo ||
                    !email
                }
              )}
              disabled={
                loadingInfo || !email
              }
            >
              {loadingInfo ? "Loading..." : "Save Changes"}
            </button>

          </form>
        )}
        {messageInfo && (
          <div
            className={`mt-2 p-2 rounded-md ${messageTypeInfo === "success" ? "text-green-500" : "text-red-500"
              }`}
          >
            {messageInfo}
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className={cn(
              "mt-4 bg-red-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-red-600",
              {
                "cursor-not-allowed bg-gray-500 hover:bg-gray-500":
                  loading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword,
              }
            )}
            disabled={
              loading || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {loading ? "Loading..." : "Save Changes"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-2 rounded-md ${messageType === "success" ? "text-green-500" : "text-red-500"
              }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;