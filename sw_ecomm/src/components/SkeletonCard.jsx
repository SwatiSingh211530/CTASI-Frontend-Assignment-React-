/**
 * Skeleton loader card – shown while products are being fetched.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-52 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-lg mt-4" />
      </div>
    </div>
  );
}
