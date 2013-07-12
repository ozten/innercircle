# Files with no extension to .json

    cd some_data_dir
    for file in `ls . | grep -v comments | grep -v "\.json"`; do mv $file ${file}.json; done
    cd comments
    for file in `ls . | grep -v "\.json"`; do mv $file ${file}.json; done

# Move posts to posts dir

    cd some_data_dir
    mkdir posts
    for file in `ls *.json`; do mv $file posts/; done