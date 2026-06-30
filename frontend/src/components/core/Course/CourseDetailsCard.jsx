import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: _id,
  } = course

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-richblack-600 bg-richblack-700 p-4 text-richblack-5 shadow-[0px_0px_15px_-3px_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-richblack-500">
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-full overflow-hidden rounded-xl object-cover"
        />

        <div className="px-2">
          <div className="space-x-3 pb-4 text-3xl font-semibold">
            Rs. {CurrentPrice}
          </div>

          <div className="flex flex-col gap-4">
            <button
              className="cursor-pointer rounded-md border border-yellow-50 bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-richblack-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] transition-all duration-200 hover:scale-95 hover:shadow-none focus:outline-none active:scale-95"
              onClick={
                user && course?.studentEnrolled.includes(user?._id)
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
            >
              {user && course?.studentEnrolled.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button>

            {(!user || !course?.studentEnrolled.includes(user?._id)) && (
              <button
                onClick={handleAddToCart}
                className="cursor-pointer rounded-md border border-richblack-600 bg-richblack-800 px-6 py-3 text-center text-[13px] font-bold text-richblack-5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] transition-all duration-200 hover:border-richblack-500 hover:bg-richblack-700 hover:scale-95 hover:shadow-none focus:outline-none active:scale-95"
              >
                Add to Cart
              </button>
            )}
          </div>

          <div>
            <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
              30-Day Money-Back Guarantee
            </p>
          </div>

          <div>
            <p className="my-2 text-xl font-semibold">
              This Course Includes :
            </p>
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => (
                <p className="flex gap-2" key={i}>
                  <BsFillCaretRightFill className="mt-[2px] shrink-0" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              className="mx-auto flex cursor-pointer items-center gap-2 py-6 text-yellow-100 transition-all duration-200 hover:text-yellow-50 hover:underline"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard