import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  AppState
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { verifyQRLoginService } from '../../service/authService';
import { useSelector } from 'react-redux';

// Component quét QR cho Web
const WebQRScanner = ({ onScan, scanned }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const captureIntervalRef = useRef(null);
  
    useEffect(() => {
        // Chỉ trên Web mới tiếp tục
        if (Platform.OS !== 'web') return;
        
        startCamera();
        
        return () => {
            // Dọn dẹp
            stopCamera();
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
        };
    }, []);
  
    // Bắt đầu camera
    const startCamera = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            setStream(videoStream);
            
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.play();
                
                // Chụp ảnh định kỳ mỗi 3 giây và gửi lên API
                captureIntervalRef.current = setInterval(() => {
                if (scanned) return;
                    captureFrameAndProcess();
                }, 3000); // Chụp mỗi 3 giây
            }
        } catch (err) {
            console.error("Không thể truy cập camera:", err);
        }
    };
  
    // Dừng camera
    const stopCamera = () => {
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => {
                track.stop();
                track.onended = null;
                track.onmute = null;
                track.onunmute = null;
                track.onoverconstrained = null;
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.pause();
            }
            
            setStream(null);
        }
        if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        }
    };

    // Chụp khung hình và xử lý
    const captureFrameAndProcess = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            
            // Lấy kích thước video
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;
            
            // Cập nhật kích thước canvas
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            
            // Vẽ khung hình từ video lên canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, videoWidth, videoHeight);
            
            // Chuyển canvas thành blob và gửi tới API
            canvas.toBlob((blob) => {
                if (blob) {
                  processQRWithAPI(blob);
                }
            }, 'image/jpeg');
        }
    };
  
    // Xử lý QR với API
    const processQRWithAPI = async (blob) => {
        try {
        // Tạo form data để gửi ảnh
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        formData.append('MAX_FILE_SIZE', '1048576');
        
        console.log("Web scanner: Đang gửi khung hình đến API QR Server");
        const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Kiểm tra kết quả
        if (result && 
            result[0] && 
            result[0].symbol && 
            result[0].symbol[0] && 
            result[0].symbol[0].data) {
            
            // Tìm thấy mã QR
            const qrData = result[0].symbol[0].data;
            console.log("Web scanner: Tìm thấy mã QR:", qrData);
            
            // Dừng chụp hình
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
            
            // Gọi callback
            onScan({ type: 'qr', data: qrData });
        } else {
            console.log("Web scanner: Không tìm thấy mã QR trong khung hình");
        }
        } catch (error) {
            console.error("Web scanner: Lỗi khi gửi khung hình đến API:", error);
        }
    };
  
    return (
        <View style={{flex: 1, width: '100%', height: '100%'}}>
            <video
                ref={videoRef}
                style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                }}
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                style={{
                display: 'none',
                }}
            />
        </View>
    );
};

// Component để sử dụng camera trên mobile
const CustomCameraScanner = ({ onScan, scanned }) => {

    const cameraRef = useRef(null);
    const captureIntervalRef = useRef(null);

    useEffect(() => {
        // Gọi việc chụp ảnh định kỳ
        if (!scanned) {
            captureIntervalRef.current = setInterval(() => {
                takePicture();
            }, 3000); // Chụp mỗi 3 giây
        }
        
        return () => {
            // Dừng chụp ảnh khi unmount hoặc khi đã quét được
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
        };
    }, [scanned]);

    // Chụp ảnh và gửi đến API
    const takePicture = async () => {
        if (cameraRef.current && !scanned) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1,
                    base64: true,
                    exif: false,
                    skipProcessing: true,
                    imageType: 'jpg',
                });
                
                // Gửi ảnh đến API để quét QR
                await processQRImageWithAPI(photo.uri);
            } catch (error) {
                console.error('Lỗi khi chụp ảnh:', error);
            }
        }
    };

    // Hàm cắt ảnh thành hình vuông sau khi chụp
    const cropToSquare = async (imageUri) => {
        try {
            // Lấy kích thước gốc của ảnh
            const imageInfo = await ImageManipulator.manipulateAsync(
              imageUri,
              [], // Không áp dụng thao tác nào
              { base64: false }
            );
            
            const { width, height } = imageInfo;
            console.log("Mobile camera: Kích thước ảnh gốc:", width, height);

            let size, originX, originY;

            if (width !== height) {
                // Lấy kích thước nhỏ nhất để đảm bảo cắt hình vuông
                size = Math.min(width, height) * 0.5; // 80% kích thước để đảm bảo tập trung vào trung tâm
                
                // Tính toán điểm bắt đầu để cắt từ trung tâm
                originX = Math.floor((width - size) / 2);
                originY = Math.floor((height - size) / 2);
            } else {
                // Nếu ảnh đã là hình vuông, chỉ cần lấy phần giữa
                size = width * 0.5; // 50% kích thước
                originX = Math.floor(width * 0.25); // 25% offset từ mỗi cạnh
                originY = Math.floor(height * 0.25);
            }

            //Thực hiện cắt ảnh ở vị trí trung tâm
            const croppedResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ 
                    crop: { 
                        originX: originX, 
                        originY: originY, 
                        width: size, 
                        height: size 
                    } 
                }],
                { 
                    compress: 0.7,
                    format: ImageManipulator.SaveFormat.JPEG
                }
            );

            // Resize xuống kích thước phù hợp để gửi qua API
            const resizedResult = await ImageManipulator.manipulateAsync(
                croppedResult.uri,
                [{ resize: { width: 400, height: 400 } }],
                { 
                    compress: 0.7, 
                    format: ImageManipulator.SaveFormat.JPEG, 
                    base64: true 
                }
            );

            // const imageDataUrl = `data:image/jpeg;base64,${resizedResult.base64}`;
            // console.log("Image Data URL:", imageDataUrl);

            return resizedResult.uri;

        } catch (error) {
            console.error('Lỗi khi resize/crop ảnh:', error);
            return imageUri;
        }
    };

    //Gửi ảnh cho API Mobile chụp
    const processQRImageWithAPI = async (imageUri) => {
      try {

        imageUri = await cropToSquare(imageUri);
        console.log("Mobile camera: Đang xử lý ảnh với API QR Server");
        console.log("Mobile camera: URI ảnh:", imageUri);
        
        // Tạo form data để gửi ảnh
        const formData = new FormData();
        
        // Xử lý dựa trên nền tảng
        if (Platform.OS === 'web') {
          // Trên web, chuyển đổi URI thành Blob
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          formData.append('file', blob, 'qrcode.jpg');
        } else {
          // Trên mobile, thêm trực tiếp
          formData.append('file', {
            uri: imageUri,
            name: 'qrcode.jpg',
            type: 'image/jpeg'
          });
        }
        
        // Thêm giới hạn kích thước file
        formData.append('MAX_FILE_SIZE', '1048576');
        
        // Gọi API
        console.log("Mobile camera: Đang gửi ảnh đến API QR Server");
        const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Phân tích kết quả
        const result = await response.json();
        console.log("Mobile camera: Kết quả từ API QR Server:", JSON.stringify(result));
        
        // Kiểm tra kết quả
        if (result && 
            result[0] && 
            result[0].symbol && 
            result[0].symbol[0] && 
            result[0].symbol[0].data) {
            
          // Tìm thấy mã QR
          const qrData = result[0].symbol[0].data;
          console.log("Mobile camera: Tìm thấy mã QR:", qrData);
          
          // Dừng chụp hình
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
          }
          
          // Gọi callback
          onScan({ type: 'qr', data: qrData });
        } else {
          console.log("Mobile camera: Không tìm thấy mã QR trong ảnh");
        }
      } catch (error) {
        //console.error("Mobile camera: Lỗi khi xử lý ảnh:", error);
      }
    };

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={false}
                ratio="1:1"
            />
        </View>
    );

};

const QRScannerScreen = () => {
    const navigation = useNavigation();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const cameraRef = useRef(null);

    useEffect(() => {
        console.log("User information from Redux:", JSON.stringify(user));
    }, [user]);

    // Yêu cầu quyền truy cập camera
    useEffect(() => {
        (async () => {
        if (Platform.OS === 'web') {
            // Trên web, sử dụng navigator.mediaDevices API của trình duyệt
            try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            if (stream) {
                setHasPermission(true);
            }
            } catch (err) {
                console.error("Không thể truy cập camera:", err);
                setHasPermission(false);
            }
        } else {
            // Trên thiết bị di động, sử dụng expo-camera API
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        }
        })();

        // Cleanup function
        return () => {
        if (Platform.OS === 'web' && navigator.mediaDevices) {
            //Tắt camera
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {
                const tracks = stream.getTracks();
                tracks.forEach(track => {
                track.stop();
                });
            })
            .catch(err => console.log('Media devices access cleanup error:', err));
            
            //Dừng mediastream
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                devices.forEach(device => {
                    if (device.kind === 'videoinput') {
                    // Dừng tất cả video streams có thể truy cập
                    navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })
                        .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        })
                        .catch(() => {/* Ignore errors */});
                    }
                });
                })
                .catch(err => console.log('Error enumerating devices:', err));
            }
        }else {
            //Tắt camera mobile
            if (cameraRef.current) {
                try {
                    if (cameraRef.current.pausePreview) {
                    cameraRef.current.pausePreview();
                    }
                } catch (error) {
                    console.log('Camera pause error:', error);
                }
            }
        }
        };
    }, []);

  // Chuyển sang chạy nền tắt cam luôn
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Tắt camera khi ứng dụng chạy nền
        if (Platform.OS === 'web') {
          // Trên web
          if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ video: true })
              .then(stream => {
                stream.getTracks().forEach(track => track.stop());
              })
              .catch(() => {/* Ignore errors */});
          }
        } else {
          // Trên mobile
          if (cameraRef.current && cameraRef.current.pausePreview) {
            cameraRef.current.pausePreview();
          }
        }
      }
    };

    // Đăng ký listener trên cả web và mobile
    if (Platform.OS === 'web') {
        // Trên web, sử dụng visibilitychange event
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                handleAppStateChange('background');
            } else {
                handleAppStateChange('active');
            }
        });
    } else {
        // Trên mobile, sử dụng AppState từ react-native
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        // Cleanup
        return () => {
            subscription.remove();
        };
    }
  }, []);

    //Xử lý khi user chọn ảnh từ thư viện
    const pickImage = async () => {
        try {

            console.log("Đang chọn ảnh từ thư viện");

            // Yêu cầu quyền truy cập media library
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Không có quyền', 'Cần cấp quyền truy cập thư viện ảnh để tiếp tục');
                    return;
                }
            }

            // Lấy ảnh từ thư viện
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            console.log("Kết quả image picker:", JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                setProcessing(true);
                console.log("URI ảnh được chọn:", result.assets[0].uri);

                await processImageWithQRServerAPI(result.assets[0].uri);
                
                setProcessing(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
            setProcessing(false);
        }
    };

    // Hàm xử lý ảnh với API QR Server Thư viện
    const processImageWithQRServerAPI = async (imageUri) => {
    try {
        console.log("Đang xử lý ảnh với API QR Server");
        
        // Tạo form data để gửi ảnh
        const formData = new FormData();
        
        // Tạo blob từ URI
        if (Platform.OS === 'web') {
            // Trên web, cần chuyển đổi URI thành Blob
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            formData.append('file', blob, 'qrcode.jpg');
        } else {

          // Trên mobile, trực tiếp thêm URI như một file
          formData.append('file', {
              uri: imageUri,
              name: 'qrcode.jpg',
              type: 'image/jpeg'
          });

        }
        
        // Thêm giới hạn kích thước file
        formData.append('MAX_FILE_SIZE', '1048576');
        
        // Gọi API
        console.log("Đang gửi ảnh đến API QR Server");
        const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Phân tích kết quả
        const result = await response.json();
        console.log("Kết quả từ API QR Server:", JSON.stringify(result));
        
        // Kiểm tra kết quả
        if (result && 
            result[0] && 
            result[0].symbol && 
            result[0].symbol[0] && 
            result[0].symbol[0].data) {
        
        // Tìm thấy mã QR
        const qrData = result[0].symbol[0].data;
        console.log("Đã tìm thấy mã QR:", qrData);

        setScanned(false);
        setProcessing(false);
        
        // Xử lý mã QR
        await handleBarCodeScanned({
            type: 'qr',
            data: qrData
        });
        
        } else {
            // Không tìm thấy mã QR
            console.log("API không tìm thấy mã QR trong ảnh");
            Alert.alert(
                'Không tìm thấy mã QR', 
                'Không thể phát hiện mã QR trong ảnh. Hãy thử với ảnh khác hoặc chụp rõ hơn.'
            );
        }
        } catch (error) {
            console.error("Lỗi khi xử lý ảnh với API QR Server:", error);
            Alert.alert(
            'Lỗi', 
            'Đã xảy ra lỗi khi xử lý ảnh. Vui lòng thử lại hoặc chọn ảnh khác.'
            );
        }
    };

    // Xử lý khi quét được QR code
    const handleBarCodeScanned = async ({ type, data }) => {
        try {

            // Kiểm tra nếu đã quét hoặc đang xử lý thì bỏ qua
            if (scanned || processing) {
                console.log("Đã quét hoặc đang xử lý, bỏ qua");
                return;
            }

            setScanned(true);
            setProcessing(true);

            // Kiểm tra xem data có phải là QR đăng nhập không
            if (!data || typeof data !== 'string') {
                console.log("QR code không hợp lệ:", data);
                Alert.alert('Lỗi', 'QR code không hợp lệ');
                setProcessing(false);
                return;
            }

            console.log("Quét được mã QR:", data);

            // Kiểm tra người dùng đã đăng nhập chưa (cần có user._id)
            if (!user || !user._id) {
                console.log("Người dùng chưa đăng nhập");
                Alert.alert(
                'Chưa đăng nhập', 
                'Bạn cần đăng nhập trước khi sử dụng tính năng này',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                setProcessing(false);
                return;
            }

            console.log("User ID:", user._id);
            console.log("Chuẩn bị gọi API xác thực QR code");

            try {

                // Gọi API xác thực QR code với timeout tránh treo
                const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 20000)
                );
        
                const apiPromise = await verifyQRLoginService(data, user._id);
                const response = await Promise.race([apiPromise, timeoutPromise]);

                console.log("Kết quả từ API xác thực QR:", JSON.stringify(response));

                if (response && response.EC === 0) {
                    // Thành công
                    Alert.alert(
                        'Thành công',
                        'Đăng nhập thành công trên thiết bị web!',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    // Thất bại
                    Alert.alert(
                        'Lỗi',
                        response.EM || 'Không thể xác thực mã QR',
                        [{ text: 'Thử lại', onPress: () => setScanned(false) }]
                    );
                }

            } catch (apiError) { 
                console.error("Lỗi khi gọi API xác thực:", apiError);
                
                let errorMessage = 'Đã xảy ra lỗi khi xử lý mã QR';
                if (apiError.message === 'Timeout') {
                errorMessage = 'Yêu cầu hết thời gian. Kiểm tra kết nối mạng và thử lại.';
                }
                
                Alert.alert(
                'Lỗi',
                errorMessage,
                [{ text: 'Thử lại', onPress: () => setScanned(false) }]
                );
            }

        } catch (error) {
            console.error('Error scanning QR code:', error);
            Alert.alert(
                'Lỗi',
                'Đã xảy ra lỗi khi xử lý mã QR',
                [{ text: 'Thử lại', onPress: () => setScanned(false) }]
            );
        } finally {
            setProcessing(false);
        }
    };

    // Hiển thị thông báo nếu chưa có quyền
    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 20 }}>Đang yêu cầu quyền truy cập camera...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
        <View style={styles.container}>
            <Text style={styles.permissionText}>Cần cấp quyền truy cập camera để quét mã QR</Text>
            <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => navigation.goBack()}
            >
            <Text style={styles.buttonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
        );
    }

    // Render component dựa vào nền tảng
    return (
        <View style={styles.container}>

        {Platform.OS === 'web' ? (
            // Web version - sử dụng WebQRScanner
            <WebQRScanner
                onScan={handleBarCodeScanned}
                scanned={scanned}
            />
        ) : (
            // Mobile version - sử dụng Camera
            <CustomCameraScanner
                onScan={handleBarCodeScanned}
                scanned={scanned}
            />
        )}
        
        {/* Overlay hướng dẫn quét */}
        <View style={styles.overlay}>
            <View style={styles.unfilled} />
            <View style={styles.row}>
            <View style={styles.unfilled} />
            <View style={[styles.square, { width: 250, height: 250 }]}>
                {/* Góc trên trái */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                {/* Góc trên phải */}
                <View style={[styles.corner, styles.cornerTopRight]} />
                {/* Góc dưới trái */}
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                {/* Góc dưới phải */}
                <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={styles.unfilled} />
            </View>
            <View style={styles.unfilled}>
            <Text style={styles.scanText}>
                Di chuyển camera đến mã QR đăng nhập
            </Text>
            </View>
        </View>

        {/* Nút quay lại */}
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
        >
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Nút chọn ảnh từ thư viện */}
        <TouchableOpacity 
            style={styles.galleryButton}
            onPress={pickImage}
            disabled={processing}
        >
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.galleryButtonText}>Thư viện</Text>
        </TouchableOpacity>
        
        {/* Nút quét lại */}
        {scanned && !processing && (
            <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
            >
            <Text style={styles.buttonText}>Quét lại</Text>
            </TouchableOpacity>
        )}

        {/* Hiển thị đang xử lý */}
        {processing && (
            <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Đang xử lý...</Text>
            </View>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfilled: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  square: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    zIndex: 10,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    padding: 10,
  },
  permissionText: {
    margin: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  processingContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  galleryButton: {
    position: 'absolute',
    bottom: 40,
    left: 20, // Đặt ở góc trái dưới
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default QRScannerScreen;