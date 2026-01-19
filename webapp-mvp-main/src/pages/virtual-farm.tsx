export default function VirtualFarm() {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <iframe
        // src="http://localhost:4000/"
        src='https://backend-mvp-43nd.onrender.com/'
        title='Rainforest Proxy'
        className='w-full h-screen'
        allowFullScreen
      />
    </div>
  );
}
