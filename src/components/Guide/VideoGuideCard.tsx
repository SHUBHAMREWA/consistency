export default function VideoGuideCard() {
  const videoId = 'ItZ1Vy70ung';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <div className="bg-white dark:bg-[#1a0b2e] sm:rounded-2xl border-y sm:border border-slate-100 dark:border-purple-800/50 sm:shadow-sm p-4 sm:p-6">
      <div className="flex flex-col items-center text-center">
        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-purple-50 tracking-tight mb-4 sm:mb-5">
          How to Use HabitTrack in 2 minutes
        </h3>

        {/* Video Player Embed */}
        <div className="w-full max-w-[320px] sm:max-w-[340px]">
          <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-purple-800/80 bg-black">
            <iframe
              src={embedUrl}
              title="How to Use HabitTrack in 2 minutes"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
