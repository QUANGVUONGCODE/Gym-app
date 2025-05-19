import Footer from '@/components/footer/footer';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Box, Text, Input, Button, Avatar } from 'zmp-ui'; // Các thành phần có sẵn trong zmp-ui
import SelectExercise from '@/components/home/selectedExercise';
import SelectExercise3 from '@/components/exercise3';
import { useAppNavigation } from '@/utils/navigation';
const TranningPage: React.FC = () => {
    const userId = 1;
    const { goback } = useAppNavigation();
    return (
        <>
            {/*  */}
            <Box className="justify-center items-center mt-16">
                            {/* Đặt các phần tử trong cùng một container */}
                            <Box className="flex justify-between items-center px-4">
                                {/* Nút quay lại */}
                                <div
                                    onClick={goback}
                                    className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-md cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="text-[24px] text-black" />
                                </div>
            
                                {/* Tiêu đề Categories */}
                                <Text className="text-[24px] font-bold mr-24">Categories</Text>
                            </Box>
                        </Box>
            {/* popular training */}
            <SelectExercise />
            {/* Just for u */}
            <SelectExercise3 />
            <Footer />

        </>
    );
};

export default TranningPage;  