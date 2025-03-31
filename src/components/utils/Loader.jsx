
const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white backdrop-blur-md z-50">
            <div className="relative">
                <div className="w-24 h-2 border-4 border-gray-300 border-t-yellow-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-full h-full blur-md opacity-50 bg-yellow-600 rounded-full"></div>
            </div>
        </div>
    );
};

export default Loader;


// const DotsWaveLoader = () => {
//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-md z-50">
//             <div className="flex space-x-2">
//                 <div className="w-4 h-4 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
//                 <div className="w-4 h-4 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                 <div className="w-4 h-4 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//             </div>
//         </div>
//     );
// };

// export default DotsWaveLoader;
