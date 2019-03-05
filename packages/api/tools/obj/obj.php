<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$file = "obj.dat";

$objs = parse_ini_file($file, true, INI_SCANNER_RAW);

$global_attributes = array("name", "grhindex", "objtype");

$servername = "localhost";
$username = "iquall";
$password = "iquallnet";
$dbname = "mob";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error)
{
    die("Connection failed: " . $conn->connect_error);
}


foreach($objs as $object_id => $obj)
{
	$object_id = substr($object_id, 3);

	$sql = "INSERT INTO objects (name, graphic_id, object_type_id) VALUES ('" . $obj['Name'] . "'," . $obj['GrhIndex'] . "," . $obj['ObjType'] . ")";
	
	if(!$conn->query($sql) === TRUE)
	{
	    echo "Error: " . $sql . "<br>" . $conn->error;
	}

	foreach($obj as $attribute => $value)
	{
		$attribute = strtolower($attribute);
		if(in_array($attribute, $global_attributes)) continue;

		$sql = "SELECT id FROM attributes WHERE name ='" . $attribute . "'";
		$result = $conn->query($sql);

		/*if (!$result->num_rows)
		{
		    $sql = "INSERT INTO attributes (name)
			VALUES ('" . $attribute . "')";

			if(!$conn->query($sql) === TRUE)
			{
			    echo "Error: " . $sql . "<br>" . $conn->error;
			}
		}*/

		if($result->num_rows > 0)
		{
		   $row = $result->fetch_assoc();
		   $attribute_id = $row['id'];
		}

		//utf8 (tildes?)
		$value = utf8_decode($value);

		if(!is_numeric($value))
		{
			$value = "'" . $value . "'";
		}

		/*$sql = "INSERT INTO objects_attributes (object_id, attribute_id, value) VALUES (" . $object_id . "," . $attribute_id . "," . $value . ")";
	
		if(!$conn->query($sql) === TRUE)
		{
		    echo "Error: " . $sql . "<br>" . $conn->error;
		}*/
	}
}

$conn->close();