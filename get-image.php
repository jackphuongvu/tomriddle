<?php
if (isset($_POST['image'])) {

    $imageData = $_POST['image'];
    //exit($imageData);
 
    // Remove the headers (data:,) part.  
    $filteredData = substr($imageData, strpos($imageData, ",") + 1);

    // Need to decode before saving since the data we received is already base64 encoded
    $unencodedData=base64_decode($filteredData);

    // fix for IE catching or PHP bug issue
	header("Pragma: public");
	header("Expires: 0"); // set expiration time
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
	// browser must download file from server instead of cache

    // force download dialog
	header("Content-Type: application/force-download");
	header("Content-Type: application/octet-stream");
	header("Content-Type: application/download");
    header("Content-disposition: attachment; filename=typewritesomething.jpg");
    header("Content-Transfer-Encoding: binary");
    header("Content-Length: " . strlen( $unencodedData ));
    exit( $unencodedData );

} else {
	echo 'no image';
}
?>