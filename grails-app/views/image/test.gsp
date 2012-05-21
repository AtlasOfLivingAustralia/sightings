<%--
  Created by IntelliJ IDEA.
  User: markew
  Date: 9/05/12
  Time: 1:08 PM
  To change this template use File | Settings | File Templates.
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
  <title>Image upload test</title>
</head>
<body>
<g:uploadForm method="post" name="imageForm" action="upload">

    <input type="file" name="file" value=""/>

    <div class="buttons">
        <span class="button"><input type="submit" name="_action_upload" value="Update" class="save"></span>
        <span class="button"><input type="submit" name="_action_removeImage" value="Remove image" class="cancel"></span>
        <span class="button"><input type="submit" name="_action_cancel" value="Cancel" class="cancel"></span>
    </div>

</g:uploadForm>
</body>
</html>